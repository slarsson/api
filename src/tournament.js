'use strict';

const LIBRARY = require('../lib.js');
const t = require('../tournament/create.js');
const Progress = require('../tournament/progress.js');

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

    // check korrekt nummer eller string osv osv.. 
    // rounds = fel!!!!
    async create(user){
        const required = ["name", "team", "group", "rounds", "type"];
        let input = await this.post();

        if(!this.isset(input, required)){
            this.render({status: false, error: "empty fields"}); return;
        }

        let teams = this.extract_value('team', input);
        input = this.format(input);

        
        if(!this.is_number([input.type, input.group, input.rounds])){
            this.render({status: false, error: "NaN"}); return;
        }
   
        if(typeof teams === 'string'){teams = [teams];}
        teams = teams.map((item) => {return this.sanitize(item);});

        const {data, status, error} = await new t(user, input, teams).generate();
        if(!status){
            this.render({status: false, error: error}); return;
        }
        
        //this.render(data);
        this.render(await this.db.insert_with_unique_id('tournaments', data, this.random_id, null, 'id'));
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

        if(this.query.group != null){
            if(target.groups[this.query.group] == null){
                this.render({status: false, error: "group not found"}); return;
            }
            if(new Progress(target).complete(this.query.group, true)){
                changes['groups.' + this.query.group + '.completed'] = true;
            }else {
                this.render({status: false, error: "group not completed"}); return;
            }
        }


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
                const target = await this.db.find('tournaments', {id: this.query.t});
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