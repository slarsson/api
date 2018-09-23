'use strict';

const Lib = require('../lib.js');

class Index extends Lib {
    constructor(req, res){
        super(req, res);
        this.res = res;
    }

    index(){
        this.render({name: "test api"});
    }
}

module.exports = Index;