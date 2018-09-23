'use strict';

const Lib = require('../lib.js');

class Login extends Lib {
    constructor(req, res, query){
        super(req, res);
        this.query = query;
        this.method = req.method;
        
        this.req = req;
        this.res = res;
    }

    index(){
        if(this.method == 'GET'){this.status(); return;}
        if(this.method == 'POST'){this.check(); return;}
        if(this.method == 'PATCH'){this.update(); return;}
        this.render({status: "method not found"});
    }

    _status(){
        this.render({"value": "nothing to see here.."});
    }

    check(){
        if(!this.authorized(true)){return;}

        this.post((x) => {
            console.log(x);
            //let query = {id: "T6GDTXQEyr"};
            this.find('test_collection', x, (res) => {
                this.render(res);
            });
        });   
    }

    status(){
        //this.query = {"id": "5ba7d27bee1294648c9252f9"};
        this.find('test_collection', this.query, (res) => {
            this.render(res);
        });  
    }

    update(){
        this.edit('test_collection', {id: "294npkp5SJ"}, this.query, (res) => {
            this.render(res);
        });
    }

    _remove(){
        this.query = {"id": "xeRz4KFjed"};
        this.remove('test_collection', this.query, (res) => {
            this.render(res);
        });
    }

    _add(){
        let template = require('../json/test_input.json');
        template.name = this.query.name;
        template.city = this.query.city;
        template.street = this.query.street;


        this.insert('test_collection', template, (res) => {
            this.render(res);
        });
    }
}

module.exports = Login;