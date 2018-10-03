'use strict';

const LIBRARY = require('../lib.js');

class Index extends LIBRARY {
    constructor(req, res){
        super(req, res);
    }

    index(){
        this.render({test: "bowling"});
    }
}

module.exports = Index;