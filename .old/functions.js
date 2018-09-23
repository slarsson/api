'use strict';

const qs = require('querystring');
const url = require('url');

const not_found = (res, json) => {
    res.writeHead(404, {"Content-Type": "application/json"});
    res.end(JSON.stringify(json, null, 0));    
};

const redirect = (res, url) => {
    res.writeHead(301, {'Location': url});
    res.end();
};

const render = (res, json, modify) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','Origin, Content-type, Accept');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, PUT, DELETE, HEAD, OPTIONS');
    res.end(JSON.stringify(json, null, 0));    
};

const router = (request_url) => {
    const input = url.parse(request_url, true);

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

module.exports = {
    render: render,
    redirect: redirect,
    error: not_found,
    router: router
};