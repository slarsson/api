'use strict';

const Lib = require('../lib.js');

class User extends Lib {
    constructor(req, res){
        super(req, res);
        this.res = res;
    }

    index(){
        this.render({location: "/user"});
    }
};

module.exports = User;