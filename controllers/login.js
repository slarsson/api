'use strict';

const LIBRARY = require('../lib.js');

class Login extends LIBRARY {
    constructor(req, res, query){
        super(req, res);   
    }

    index(){
        if(this.method == 'GET'){this.status(); return;}
        if(this.method == 'POST'){this.check(); return;}
        this.render({status: false});
    }

    async status(){
        const session = await this.authenticate();
        if(session){
            this.render(session);
            return;
        }
        this.render({login: false});
    }

    async check(){
        const input = await this.post();

        if(input.username == undefined || input.password == undefined){
            this.render({login: false});
            return;
        }

        const user = await this.db.find('users', {username: input.username});
        const password = this.hash(input.password, (input.username+'nm/&(xx2d329738d2b36#'));

        if(user == null || user.password != password){
            this.render({login: false});
            return;
        }
        
        const cookie = this.parse_cookie();
        if(cookie != undefined && cookie.session != undefined){
            this.db.remove('sessions', {id: cookie.session});
        }

        const time  = new Date().getTime();
        const session = {
            username: user.username,
            update: time,
            expire: time + (3600*1000),
            ip: this.req.connection.remoteAddress,
            useragent: this.req.headers['user-agent']
        };

        const data = await this.db.insert_with_unique_id('sessions', session, this.random_id, 'id');
        this.render({login: true}, 200, {'Set-Cookie':'session='+data[1].id+'; path=/'}); 
    }
}

module.exports = Login;