'use strict';

const Library = require('../lib.js');

class Index extends Library {
    constructor(req, res, query){
        super(req, res);
        this.query = query;
    }

    async index(){
        if(this.query.t != null){
            let projection = {}; 
            projection._id = 0;
            
            const types = ["groups", "bracket", "name", "id", "teams"];
            if(this.query.type != null && typeof this.query.type != 'number'){
                const items = this.query.type.split(':');
                items.map((item) => {
                    if(types.includes(item)){projection[item] = 1;}
                });
            }
            
            let data = await this.db.find('tournaments', {id: this.query.t}, projection); 
            if(data != null){
                this.render(data);
                return;
            }
        }
        this.render({status: false}, 404); return;
    }
}

module.exports = Index;