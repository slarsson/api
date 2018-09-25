'use strict';

const Db = require('./db.js');
const qs = require('querystring');
const fs = require('fs');

class Library {
    constructor(req, res){
        this.db = new Db();
        this.req = req;
        this.res = res;
    }

    format(json){
        //format json
        return json;
    }

    post(cb){
        let body = '';
        this.req.on('data', (chunk) => {
            body += chunk;
            if(body.length > 1e6){req.connection.destroy();}//1MB = max size
        });
        this.req.on('end', () => {
           cb(qs.parse(body));
        });
    }

    merge(query, template){
        for(let key in query){
            let target = template;
            let index = null;
            let sub_keys = key.split('.');
            
            if(sub_keys.length > 1){
                index = sub_keys[sub_keys.length-1];
                sub_keys.splice(-1, 1);
                for(let keys of sub_keys){target = target[keys];}
            }else {
                index = key;
            }

            if(!(target[index] === undefined || (target[index] !== null && typeof target[index] == 'object') || typeof query[key] == 'object')){
                target[index] = this.sanitize(query[key]);
            }
        }
        return template;
    }

    get_template(filename, cb){
        fs.readFile("./json/"+filename+".json", (err, data) => {
            let obj = {};
            try{
                if(err){throw err;} 
                obj = JSON.parse(data);
            }catch(e){console.log(e);}
            cb(obj);
        });
    }

    sanitize(text){
        text = require('sanitize-html')(text, {allowedTags: [], allowedAttributes: []});
        return text.trim();
    }

    render(json){
        this.res.setHeader('Content-Type', 'application/json');
        this.res.setHeader('Access-Control-Allow-Origin','*');
        this.res.setHeader('Access-Control-Allow-Headers','Origin, Content-type, Accept');
        this.res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, PUT, DELETE, HEAD, OPTIONS');
        this.res.end(JSON.stringify(json, null, 0));    
    }  
}

module.exports = Library;