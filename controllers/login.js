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
        let session = await this.authenticate();
        if(session){
            this.render(session);
            /*this.render({
                login: true,
                username: session.username,
                session: session.id
            });*/
            return;
        }
        this.render({login: false});
    }

    async check(){
        let input = await this.post();
        
        if(input.username == undefined || input.password == undefined){
            this.render({login: false});
            return;
        }

        let user = await this.db.find('users', {username: input.username});
        let password = this.hash(input.password, (input.username+'nm/&(xx2d329738d2b36#'));

        if(user.password != password){
            this.render({login: false});
            return;
        }
        
        let cookie = this.parse_cookie();
        if(cookie != undefined && cookie.session != undefined){
            this.db.remove('sessions', {id: cookie.session});
        }

        let time  = new Date().getTime();
        let expire = time + (3600*1000);
        let session = {
            username: user.username,
            update: time,
            expire: expire,
            ip: this.req.connection.remoteAddress,
            useragent: this.req.headers['user-agent']
        };

        let data = await this.db.insert_with_unique_id('sessions', session, this.random_id, 'id');
        let id = data[1].id;

        this.render({login: true}, 200, {'Set-Cookie':'session='+id+'; path=/'}); 
    }

    _logout(){
        let cookie = this.parse_cookie();
        if(cookie != undefined && cookie.session != undefined){
            this.db.remove('sessions', {id: cookie.session});
        }
        this.render({logout: true}, 200, {'Set-Cookie':'session=null; path=/'});
    }
}

module.exports = Login;