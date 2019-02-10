'use strict';

const Library = require('../lib.js');
const Results = require('../tournament/results.js');
const Progress = require('../tournament/progress.js');

class Game extends Library {
    constructor(req, res, query){
        super(req, res);
        this.query = this.format(query); 
    }

    async index(){
        const session = await this.authenticate();
        if(!session){this.render({}, 401); return;}
        if(this.method == 'PATCH'){this.update(session); return;}
        this.render({status: false}, 404);   
    }

    async update(user){
        if(!this.isset(this.query, ["t", "g", "r1", "r2"])){
            this.render({status: false, error: "empty fields"}, 404); return;    
        }

        const t = await this.db.find('tournaments', {id: this.query.t});
       
        if(t == null){
            this.render({status: false,}, 404); return;
        }

        if(!t.owners.includes(user.username) && !(user.group == 0 || user.group == 1)){
            this.render({status: false, error: "cant touch this"}, 401); return;
        }

        if(!this.is_number([this.query.r1, this.query.r2])){
            this.render({status: false, error: "NaN"}); return;    
        }
  
        let changes;
        let update = null;
        if(this.query.bracket != null && this.query.bracket == true){
            changes = new Progress(t).bracket(this.query.g, this.query.r1, this.query.r2);
        }else {
            if(t.games[this.query.g] == null){
                this.render({status: false, error: "game not found"}); return;
            }
            const res = new Results(t, this.query.g);
            if(!res.status()){
                this.render({status: false, error: "game cant be updated.."}); return;
            }

            if(res.group_completed()){
                update = true;
            }else {
                update = false;
            }

            changes = res.add(this.query.r1, this.query.r2);
        }

        if(!changes){
            this.render({status: false, error: "n/a"}); return;
        }

        let data = await this.db.edit('tournaments', {id: this.query.t}, changes);
        data.update = update;
        
        // annan fil kanske?
        // kanske inte ska göra flera db-requestz..
        if(update){
            const t2 = await this.db.find('tournaments', {id: this.query.t});
            let bracket = new Progress(t2).add_group_winners_to_bracket(t.games[this.query.g].group);
            await this.db.edit('tournaments', {id: this.query.t}, bracket);
        }

        this.render(data);
    }

    /*
    // TEST:
    async _create(){
        const t = await this.db.find('tournaments', {id: this.query.t});
        if(t == null){
            this.render(null); return;
        }
        const p = new Progress(t);
        
        const list = p.get_bracket();

        if(list == false){
            this.render(null); return;
        }

        const bracket = p.populate_bracket(list);
        //console.log(bracket);

        this.render(await this.db.edit('tournaments', {id: t.id}, {bracket: bracket}));
    }

    async _rank(){
        const t = await this.db.find('tournaments', {id: this.query.t});
        if(t == null){
            this.render(null); return;
        }
        const asdf = require('../tournament/rank.js');
        const data = new asdf(t);

        //const x = data.group(0);
        const x = data.all([1]);

        //console.log(data.sum(2, 0));

        this.render(x);
    }
    */
}

module.exports = Game;