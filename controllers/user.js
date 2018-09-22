'use strict';

class User {
    constructor(method){
        console.log(method);
    }

    _index(){
        console.log("user/index");
        return {};
    }

    info(){
        console.log("info finns!!!");
        return {"vafan": "helvete"};
    }
};

module.exports = User;