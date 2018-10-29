'use strict';

const LIBRARY = require('../lib.js');

class Index extends LIBRARY {
    constructor(req, res, query){
        super(req, res);
        this.query = this.format(query);
    }

    async index(){
        if(this.query.t != null){
            let projection = {}; 
            projection._id = 0;
            
            const types = ["groups", "bracket", "name", "id"];
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