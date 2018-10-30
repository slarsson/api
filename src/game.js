'use strict';

const LIBRARY = require('../lib.js');

class Game extends LIBRARY {
    constructor(req, res, query){
        super(req, res);  
        //this.query = this.format(query);
        //this.id = this.extract_value('id', this.query); 
    }

    index(){
        this.render({game: "updatera matcher osv goes here.."});
    }
}

module.exports = Game;