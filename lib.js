'use strict';

const Db = require('./db.js');
const qs = require('querystring');

class Library extends Db {
    constructor(req, res){
        super();
        this.req = req;
        this.res = res;
    }

    authorized(user, method){
        if(!user){
            this.render({status: 'not allowed'});
            return false;
        }
        return true;
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

    render(json){
        this.res.setHeader('Content-Type', 'application/json');
        this.res.setHeader('Access-Control-Allow-Origin','*');
        this.res.setHeader('Access-Control-Allow-Headers','Origin, Content-type, Accept');
        this.res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, PUT, DELETE, HEAD, OPTIONS');
        this.res.end(JSON.stringify(json, null, 0));    
    }
}

module.exports = Library;