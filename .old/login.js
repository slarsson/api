'use strict';

const LIBRARY = require('../lib.js');

class Login extends LIBRARY {
    constructor(req, res, query){
        super(req, res);
        this.query = this.format(query);
        this.id = this.extract_value('id', this.query);
    }

    index(){
        if(this.method == 'GET'){this.get(); return;}
        if(this.method == 'POST'){this.add(); return;}
        if(this.method == 'DELETE'){this.remove(); return;}
        this.render({status: "method not found"});
    }

    
    check(){

    }

    logout(){
        
    }
    
    
    
    
    
    
    
    
    async _sessions(){
        this.render(await this.db.find_all('sessions', {}));
    }

    async _create_session(){
        // borde kolla om session cookie redan finns
        let username = "roger";

        let t1  = new Date().getTime();
        let t2 = t1 + (3600*1000);


        let test = {
            username: username,
            update: t1,
            expire: t2,
            ip: this.req.connection.remoteAddress,
            useragent: this.req.headers['user-agent']
        };

        let arr = await this.db.insert_with_unique_id('sessions', test, this.random_id, 'id');
        test.id = arr[1].id;

        this.render(test, 200, {'Set-Cookie':'session='+test.id+'; path=/'});
    }


    async _test(){
        if(!await this.authenticate()){
            this.render({error: "my error"}, 401);
            return;
        }
        this.render(null);
    }

    async get(){
        this.render(await this.db.find_all('users', this.query));
        //this.render(await this.db.find_all('sessions', this.query));
    }

    async add(){
        let data = await this.post();

        if((await this.db.count('users', {username: data.username})) != 0){
            this.render({test: "username exists"});
            return;
        }

        let input = {
            username: data.username,
            password: this.hash(data.password),
            data: 'test'
        }

        this.render(await this.db.insert('users', input));
    }

    async remove(){
        this.render(await this.db.remove('users', {username: this.query.username}));
    }

    async _update_password(){
        if((await this.db.count('users', {username: this.query.username})) == 0){
            this.render({test: "user not found"});
            return;
        }
        
        this.render(await this.db.edit('users', {username: this.query.username}, {password: this.hash(this.query.password)}));
    }

    //BRA ATT KOMMA IHÅG:
        //let data = await Promise.all([this.post(), this.get_template('test_input')]);
}

module.exports = Login;