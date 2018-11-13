'use strict';

const http = require('http');
const qs = require('querystring');
const parse_url = require('url');
const Library = require('./lib.js');

const server = http.createServer((req, res) => {
    const input = url(req.url);
    if(input.url != null){
        new Library(req, res).render({}, 301, {Location: input.url});
        return;
    }

    try {
        let target;
        if(input.path.length != 0){
            console.log(input.path[0]);
            target = require('./src/'+input.path[0]+'.js');
        }else {
            target = require('./src/index.js');
        }
        const obj = new target(req, res, input.query);
        
        if(input.path.length > 1){
            if(input.path.length == 2 && typeof obj['_'+input.path[1]] === 'function'){
                obj['_'+input.path[1]].call(obj);
            }else {throw "404, method missing";}
        }else {
            obj.index(); 
        }
    }catch(e){
        new Library(req, res).render({status: false}, 404);
    }
});

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