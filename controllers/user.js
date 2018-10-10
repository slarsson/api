'use strict';

const LIBRARY = require('../lib.js');

class User extends LIBRARY {
    constructor(req, res, query){
        super(req, res);
        this.query = this.format(query);
        //this.id = this.extract_value('id', this.query);
    }

    async index(){
        let session = await this.authenticate();
        if(!session){this.render({}, 401); return;}
        this.render(await this.db.find('users', {username: session.username}));
    }

    async _list(){
        if(!await this.authenticate()){this.render({}, 401); return;}
        this.render(await this.db.find_all('users', this.query));
    }

    async _sessions(){
        if(!await this.authenticate()){this.render({}, 401); return;}
        this.render(await this.db.find_all('sessions', this.query));
    }

    async _profile(){
        if(!this.isset(this.query, ["user"])){
            this.render({status: false});
            return;
        }

        const res = await this.db.find('users', {username: this.query.user});
        if(res == null){
            this.render({status: false, msg: "user not found"});
            return;
        }
        this.render(res);
    }

    async _testx(){
        const x = await this.authenticate();
        if(this.authorize(x.group, [0])){
            this.render("ok");
            return;
        }
        //this.db.edit('users', {username: "admin"}, {group: 0});

        this.render("nej.");

    }

    async _bowling(){
        //this.db.edit('users', {username: "samla949"}, {password: this.hash(123, 'samla949nm/&(xx2d329738d2b36#')});
        this.render();
    }



    //TEST2:
    async _update(){
        let session = await this.authenticate();
        if(!session){this.render({}, 401); return;}
        
        if(this.query.value === undefined){
            this.render({});
            return;
        }
        let data = this.query.value;
        this.render(await this.db.edit('users', {username: session.username}, {data: data, testa: 1337}));
    }


    //TEST:
    async _add(){
        

        let data = await this.post();
        console.log(data);

        if(!this.isset(data, ["username", "password"])){
            this.render({something: "wrong"});
            return;
        }

        if((await this.db.count('users', {username: data.username})) != 0){
            this.render({test: "username exists"});
            return;
        }

        let input = {
            username: data.username,
            password: this.hash(data.password, (data.username+'nm/&(xx2d329738d2b36#')),
            data: 'test'
        }

        this.render(await this.db.insert('users', input));
    }

    async _remove(){
        this.render(await this.db.remove('users', {username: this.query.username}));
    }


    _test(){
        console.log(this.isset(this.query, ["user", "name"]));
        this.render({});
    }



    /*async _update_password(){
        if((await this.db.count('users', {username: this.query.username})) == 0){
            this.render({test: "user not found"});
            return;
        }
        
        this.render(await this.db.edit('users', {username: this.query.username}, {password: this.hash(this.query.password)}));
    }*/

};

module.exports = User;