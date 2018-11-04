'use strict';

const Library = require('../lib.js');

class Test extends Library {
    constructor(req, res, query){
        super(req, res);   
        this.query = this.format(query);
    }

    index(){
        this.render(null);
    }

    async _list(){
        this.render(await this.db.find_all('users', this.query, null, null, 0, 0));
    }

    async _sessions(){
        this.render(await this.db.find_all('sessions', this.query));
    }

    async _t(){
        this.render(await this.db.find_all('tournaments', this.query));
    }

    async _add(){
        let json = await this.get_template("./_assets/t.json");
        json.id = this.random_id();
        this.render(json);
        //this.db.insert('tournaments', json);
    }
}

module.exports = Test;