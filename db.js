'use strict';

const mongodb = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const options = {useNewUrlParser:true};
const name = 'vod';
const table = 'test_collection';

const connect = (type, input, callback) => {
    mongodb.connect(url, options, (err, db) => {
        if(err){throw err;}
        let dbo = db.db(name);

        dbo.collection(table).findOne({id: id}, (err, res) => {
            if(err){throw err;}
            if(res != null){delete res._id;}
            db.close();
            cb(res);
        });
    });
};

const find = (callback) => {

};

module.exports = {
    connect: connect
};