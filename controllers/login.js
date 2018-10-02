'use strict';

const Lib = require('../lib.js');

class Login extends Lib {
    constructor(req, res, query){
        super(req, res);
        this.req = req;
        this.method = req.method;
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

    add(){
        this.post((data) => {
            this.get_template('test_input', (template) => {
                this.db.insert_with_unique_id('test_collection', this.merge(this.format(data), template), (res, id) => {
                    res.input = id;
                    this.render(res);
                });
            });
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
        if(!await this.authorize(this.query.test)){return;}
        this.render(null);
    }

    _add_user(){
        this.get_template('user', (template) => {
            let input = this.merge(this.query, template);
            input.date = new Date().getTime();
            input.ip = this.req.connection.remoteAddress;
            input.useragent = this.req.headers['user-agent'];

            this.db.insert('sessions', input, (res) => {
                console.log(input);
                this.render(res);
            });
        });
    }

    _show_users(){
        console.log(this.req.headers['user-agent']);
        this.db.find_all('sessions', {}, (res) => {
            this.render(res);
        });
    }
}

module.exports = Login;