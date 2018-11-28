'use strict';

const Library = require('../lib.js');
const salt = 'nm/&(xx2d329738d2b36#';

class Login extends Library {
    constructor(req, res){
        super(req, res);   
    }

    index(){
        if(this.method == 'POST'){this.check(); return;}
        this.render({login: false}, 404);
    }

    async check(){
        const input = await this.post();

        if(input.username == null || input.password == null){
            this.render({login: false, error: "empty fields.."});
            return;
        }

        const user = await this.db.find('users', {username: input.username}, {username: 1, password: 1});
        const hash = this.hash(input.password, (input.username + salt));

        if(user == null || user.password != hash){
            this.render({login: false, error: "wrong password or username"});
            return;
        }
        
        const cookie = this.parse_cookie();
        if(cookie != null && cookie.session != null){
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

        const data = await this.db.insert_with_unique_id('sessions', session, this.random_id, 40, 'id');
        this.render({login: true}, 200, {'Set-Cookie':'session=' + data.id + '; path=/'}); 
    }
}

module.exports = Login;