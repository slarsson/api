"use strict";

const http = require('http');
const qs = require('querystring');
const parse_url = require('url');

const server = http.createServer((req, res) => {
    const input = url(req.url);
    if(input.url != null){
        redirect(res, input.url);
        return;
    }

    try {
        let target = {};
        if(input.path.length != 0){
            target = require('./controllers/'+input.path[0]+'.js');
        }else {
            target = require('./controllers/index.js');
        }
        const obj = new target(req, res, input.query);
        
        if(input.path.length > 1){
            if(input.path.length == 2 && typeof obj['_'+input.path[1]] === 'function'){
                obj['_'+input.path[1]].call(obj);
            }else {
                throw "404 -> method not found";
            }
        }else {
            obj.index(); 
        }
    }catch(e){
        console.log(e);
        error(res, {status: false});
        return;
    }
});

// cors error!?
const error = (res, json) => {
    res.writeHead(404, {"Content-Type": "application/json"});
    res.end(JSON.stringify(json, null, 0));    
};

const redirect = (res, new_url) => {
    res.writeHead(301, {'Location': new_url});
    res.end();
};

const url = (request_url) => {
    const input = parse_url.parse(request_url, true);

    let path = input.pathname.replace(/%20|\+/g, '');
    path = path.split('/');
    path = path.filter(item => item.match(/[^A-Za-z0-9_.-]|^$/) == null);

    let correct_url = '/'+path.join('/');
    if(path.length > 0){correct_url += '/';};
    
    if(correct_url != input.pathname){
        let q = qs.stringify(input.query);
        if(q != ''){correct_url += '?'+qs.stringify(input.query);}
    }else {
        correct_url = null;
    }

    return {
        path: path,
        query: input.query,
        url: correct_url
    };
};

server.listen(3001);