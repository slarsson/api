'use strict';

const LIBRARY = require('../lib.js');

class Logout extends LIBRARY {
    constructor(req, res, query){
        super(req, res);   
    }

    index(){
        if(this.req.method == 'POST'){
            const cookie = this.parse_cookie();
            if(cookie != undefined && cookie.session != undefined){
                this.db.remove('sessions', {id: cookie.session});
            }
            this.render({logout: true}, 200, {'Set-Cookie':'session=null; path=/'});
            return;
        }
        this.render({status: false});
    }
}

module.exports = Logout;