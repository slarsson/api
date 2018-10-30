'use strict';

const LIBRARY = require('../lib.js');

class Tournament extends LIBRARY {
    constructor(req, res, query){
        super(req, res);
        this.query = query;
    }

    async index(){
        const session = await this.authenticate();
        if(!session){this.render({}, 401); return;}
        if(this.method == 'GET'){this.self(session); return;}
        if(this.method == 'POST'){this.create(session); return;}
        if(this.method == 'PATCH'){this.update(session); return;}
        if(this.method == 'DELETE'){this.remove(session); return;}
        this.render({status: false}, 404);
    }

    async self(user){
        this.render(await this.db.find_all('tournaments', {owners: user.username}, {_id: 0, name: 1, owners: 1, id: 1, created: 1}, {created: -1}));
    }


    async create(user){
        // antal per grupp?
        // bracket mapping?
        // hur många möten?
        // edge cases?
        // kvarts- eller semi-final?
        // så många frågor, så få svar..

        const input = await this.post();
        //this.render(input);
    
        const teams = ["Arsenal", "Boden BK", "IFK Norrköping", "Manchester United", "FC Barcelona", "KHK", "AIK", "Chelsea", "Brommapojkarna", "Luleå Hockey"];



        let tournament = {
            name: "test",
            created: new Date().getTime(),
            owners: [user.username],
            teams: teams,
            groups: [
                [0, 1, 2, 3, 4],
                [5, 6, 7, 8, 9]
            ],
            games: [],
            bracket: []
        };

        this.render(await this.db.insert_with_unique_id('tournaments', tournament, this.random_id, null, 'id'));
    }

    async update(user){
        const target = await this.get();
        if(target === false){return;}

        if(!target.owners.includes(user.username) && !(user.group == 0 || user.group == 1)){
            this.render({status: false, error: "cant touch this"}, 401); return;
        }

        let owners = Array.from(target.owners);
        if(this.query.add != null){
            if(typeof this.query.add == 'string'){
                this.query.add = [this.query.add];
            }

            for(const owner of this.query.add){
                if(await this.db.count('users', {username: owner}) == 0){
                    this.render({status: false, error: "cant add users who not exist"}); return;
                }
                if(!owners.includes(owner)){
                    owners.push(owner); 
                }
            }
            delete this.query.add;
        }

        if(this.query.remove != null){
            if(typeof this.query.remove == 'string'){
                this.query.remove = [this.query.remove];
            }
            for(const owner of this.query.remove){
                if(owners.includes(owner)){
                    owners.splice(owners.indexOf(owner), 1);
                }    
            }
            delete this.query.remove;
        }

        let changes = {owners: owners};

        const allowed = ["name", "text"];  
        for(const item of allowed){
            if(this.query[item] != null){
                changes[item] = this.sanitize(this.query[item]);
                delete this.query[item];
            }
        }

        for(const item in this.query){
            try{
                const n = Number(item);
                if(!Number.isNaN(n)){
                    if(n >= 0 && n < target.teams.length){
                        changes['teams.'+n] = this.sanitize(this.query[item]);
                    }
                }
            }catch(e){continue;}
        }

        this.render(await this.db.edit('tournaments', {id: target.id}, changes));
    }

    async remove(user){
        const target = await this.get();
        if(target === false){return;}
        
        if(target.owners.includes(user.username) || user.group == 0 || user.group == 1){
            this.render(await this.db.remove('tournaments', {id: this.query.t}));
        }
        this.render({status: false}, 401);
    }

    get(){
        return new Promise(async (resolve) => {
            if(this.query.t != null){
                const target = await this.db.find('tournaments', {id: this.query.t}, {teams: 1, owners: 1, name: 1, id: 1, _id: 0});
                if(target != null){
                    resolve(target); return;
                }
            }                            
            this.render({status: false, error: "no target"}, 404); 
            resolve(false);
        });
    }
}

module.exports = Tournament;