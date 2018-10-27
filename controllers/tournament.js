'use strict';

const LIBRARY = require('../lib.js');

class Tournament extends LIBRARY {
    constructor(req, res, query){
        super(req, res);
    }

    index(){
        this.render({tournament: "my tournament"});
    }
}

module.exports = Tournament;