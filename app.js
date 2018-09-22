"use strict";

const http = require('http');
const lib = require('./functions.js');

const server = http.createServer((req, res) => {
    const input = lib.router(req.url);
    if(input.url != null){
        lib.redirect(res, input.url);
        return;
    }
    
    let output = {};
    try {
        let target = {};
        if(input.path.length != 0){
            target = require('./controllers/'+input.path[0]+'.js');
        }else {
            target = require('./controllers/index.js');
        }
        const obj = new target(req.method, input.query, res);
        
        if(input.path.length > 1){
            if(input.path.length == 2 && typeof obj[input.path[1]] === 'function'){
                output = obj[input.path[1]].call(this);
            }else {
                throw "404 -> method not found";
            }
        }else {
            output = obj._index();    
        }
    }catch(e){
        console.log(e);
        lib.error(res, {status: false});
        return;
    }

    lib.render(res, {results: output, method: req.method, data: input});
});

server.listen(3001);