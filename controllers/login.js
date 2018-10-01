'use strict';

const Lib = require('../lib.js');

class Login extends Lib {
    constructor(req, res, query){
        super(req, res);
        this.query = this.format(query);
        this.method = req.method;
    }

    index(){
        if(this.method == 'GET'){this.get(); return;}
        if(this.method == 'POST'){this.add(); return;}
        this.render({status: "method not found"});
    }

    get(){
        if(this.query.id === undefined){
            this.render({error: "no target"});
            return;
        }else {
            this.db.find('test_collection', {id: this.query.id}, (res) => {
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
        this.post((query) => {
            this.get_template('test_input', (template) => {
                let data = this.merge(query, template);
                //this.render(data);
                this.db.insert('test_collection', data, (res, id) => {
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


}

module.exports = Login;