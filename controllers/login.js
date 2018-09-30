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
        this.db.find_all('test_collection', this.query, (res) => {
            this.render(res);
        });
    }

    add(){
        this.post((query) => {
            this.get_template('test_input', (template) => {
                let data = this.merge(this.format(query), template);
                this.render(data);
                this.db.insert('test_collection', data, () => {});
            });
        });
    }

    _test(){
        let x = {};

            this.db.edit('test_collection', {name: "LULEÅ"}, this.query, (res) => {

            });
        
        this.render(x);
    }



    
    /*_status(){
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
        this.render(this.query);

        //this.find('test_collection', {}, (res) => {
        //    this.render(res);
        //});  
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

    _test_add(){
        this.get_template("test_input", (file) => {
            this.render(this.merge(this.query, file));
        });
    }*/
}

module.exports = Login;