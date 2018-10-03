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
        this.render({status: "method not found"});
    }

    get(){
        if(this.id == null){
            this.render({error: "no target"});
            return;
        }else {
            this.db.find('test_collection', {id: this.id}, (res) => {
                if(res == null){this.render({error: "id not found"}); return;}
                this.render(res);
            });
        }
    }

    _browse(){
        this.db.find_all('test_collection', {}, (res) => {
            this.render(res);
        });
    }

    async add(){
        let data = await Promise.all([this.post(), this.get_template('test_input')]);
        this.db.insert_with_unique_id('test_collection', this.merge(this.format(data[0]), data[1]), this.random_id, 'id', (res, id) => {
            res.input = id;
            this.render(res);
        });
    }

    _test(){
        let x = {};

            this.db.edit('test_collection', {id: this.query.id}, this.query, (res) => {
                
                this.render(res);
            });
        
    }

    _test2(){
        this.db.unset('test_collection', {name: "LULEÅ"}, this.query, (res) => {      
            this.render(res);
        });
    }

    _test3(){
        this.db.remove('test_collection', this.query, (res) => {
            this.render(res);
        });
    }

    async _test4(){
        //if(!await this.authorize(this.query.test)){return;}
        this.render(null);
    }


    async _add_user(){
        let template = await this.get_template('session');

            template.id = this.random_id();
            template.username = this.query.username;
            template.ip = this.req.connection.remoteAddress;
            template.update = new Date().getTime();
            template.expire = new Date().getTime() + 1000000;
            template.useragent = this.req.headers['user-agent'];

            this.db.insert('sessions', template, (res) => {
                console.log(template);
                this.render(res);
            });
    }

    async _show_users(){
        if(!await this.authenticate('3bilXF00tHetr8Tto9')){
            this.render({error: "not allowed"}, 401);
            return;
        }

        let x = await this.get_template('test_input');
        this.required_fields(x);
        
        //this.parse_cookie();
        this.db.find_all('sessions', {}, (res) => {
            this.render(res);
        });
    }

    async _find_user(){
        let x = await this.db.count('sessions', {username: this.query.username});
        this.render(x);
    }
}

module.exports = Login;