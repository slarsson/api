'use strict';

const DB = require('./db.js');
const qs = require('querystring');
const fs = require('fs');
const crypto = require('crypto');

class Library {
    constructor(req, res){
        this.db = new DB();
        this.req = req;
        this.res = res;
        this.method = req.method;
    }


    // TEST:
    
    // kolla att användare har access till rätt data
    authorize(key){
        return new Promise((resolve) => {
            if(key == null){key = "null";}
            this.db.find('sessions', {id: key}, (res) => {
                if(res == null){
                    this.render({status: false, error: "not authorized"}, 401); 
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    }

    // kolla att användaren är inloggad
    authenticate(id){
        return new Promise(async (resolve) => {
            let session = await this.db.find('sessions', {id: id});
            if(session == null){resolve(false); return;}
            
            let time  = new Date().getTime();
            if(session.useragent != this.req.headers['user-agent'] || session.ip != this.req.connection.remoteAddress || session.expire < time){
                console.log("error: ip/user-agent do not match session");
                await this.db.remove('sessions', {id: id});
                resolve(false); return;
            }

            let expire = new Date().getTime() + (3600*1000);
            await this.db.edit('sessions', {id: id}, {update: time, expire: expire});
            console.log(session);
            resolve(true);
        });
    }

    

    required_fields(obj){
        let x = ["name", "city", "obj1.data"];
    }






    // OK:

    post(){
        return new Promise((resolve) => {
            let body = '';
            this.req.on('data', (chunk) => {
                body += chunk;
                if(body.length > 1e6){req.connection.destroy();}//1MB = max size
            });
            this.req.on('end', () => {
                resolve(qs.parse(body));
            });
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
                target[index] = query[key];
            }
        }
        return template;
    }

    get_template(filename){
        return new Promise((resolve) => {
            fs.readFile("./json/"+filename+".json", (err, data) => {
                let obj = {};
                try{
                    if(err){throw err;} 
                    obj = JSON.parse(data);
                }catch(e){console.log(e);}
                resolve(obj);
            });
        });
    }

    sanitize(text){
        text = require('sanitize-html')(text, {allowedTags: [], allowedAttributes: []});
        return text.trim();
    }

    format(json){
        for(let key in json){
            json[key] = this.sanitize(json[key]);
            if(json[key] == 'true'){json[key] = true; continue;}
            if(json[key] == 'false'){json[key] = false; continue;}
            if(json[key] == 'null'){json[key] = null; continue;}
            
            //stora nummer!?
            try{
                let n = Number(json[key]);
                if(!Number.isNaN(n)){json[key] = n;}
            }catch(e){console.log(e);}
        }
        return json;
    }

    // only values, NOT nested objects
    // returns NULL if key do not exist
    extract_value(what, object){
        if(object[what] !== undefined && object[what] !== 'object'){
            let x = object[what];
            delete object[what];
            return x;
        }
        return null;
    }

    // lenght: lenght of string, empty = fixed size between 5-15
    random_id(length){
        let id = "";
        let data = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let n = Math.floor(Math.random() * 5) + 15;
        if(Number.isInteger(length)){n = length;}

        for(let i = 0; i < n; i++){
            id += data.charAt(Math.floor(Math.random() * data.length));
        } 
        return id;
    }

    parse_cookie(){
        if(this.req.headers['cookie'] === undefined){return undefined;}
        let item = this.req.headers['cookie'].split(';');
        
        let obj = {};
        for(let row of item){
            row = row.trim();
            obj = Object.assign(obj, qs.parse(row));
        }
        return obj;
    }

    hash(string){
        let hash =  crypto.createHash('sha256'); 
        hash.update(string);
        return hash.digest('hex');
    }

    render(json, http_status_code){
        if(http_status_code === undefined){http_status_code = 200;}
        this.res.setHeader('Content-Type', 'application/json');
        this.res.setHeader('Access-Control-Allow-Origin','*');
        this.res.setHeader('Access-Control-Allow-Headers','Origin, Content-type, Accept');
        this.res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, PUT, DELETE, HEAD, OPTIONS');
        this.res.writeHead(http_status_code);
        this.res.end(JSON.stringify(json, null, 0));    
    }  
}

module.exports = Library;