'use strict';

//const mongodb = require('mongodb').MongoClient;
const mongodb = require('mongodb');
const url = 'mongodb://localhost:27017/';
const options = {useNewUrlParser:true};
const name = 'vod';
const table = 'test_collection';

class Database {
    constructor(){}

    find(collection, query, cb){
        //test
        query = {'_id': new mongodb.ObjectID(query.id)};
        //

        mongodb.connect(url, options, (err, db) => {
            if(err){throw err;}
            let dbo = db.db(name);
    
            dbo.collection(collection).findOne(query, (err, res) => {
                if(err){throw err;}
                db.close();
                cb(res);
            });
        });
    }

    find_all(collection, query, cb){
        mongodb.connect(url, options, (err, db) => {
            if(err){throw err;}
            let dbo = db.db(name);
    
            dbo.collection(collection).find(query).toArray((err, res) => {
                if(err){throw err;}
                db.close();
                cb(res);
            });
        });
    }

    //ej klar! fungerar ej som tänkt
    insert(collection, query, cb){
        mongodb.connect(url, options, (err, db) => {
            if(err){throw err;}
            let dbo = db.db(name);
            
            delete query._id;
            dbo.collection(collection).insertOne(query, (err, res) => {
                if(err){throw err;}
                db.close();
                cb(res.insertedId);
            });
        });
    }

    remove(collection, query, cb){
        mongodb.connect(url, options, (err, db) => {
            if(err){throw err;}
            let dbo = db.db(name);
    
            dbo.collection(collection).deleteOne(query, (err, res) => {
                if(err){throw err;}
                db.close();
                cb(res.result);
            });
        });
    }
    
    edit(collection, what, query, cb){
        mongodb.connect(url, options, (err, db) => {
            if(err){throw err;}
            let dbo = db.db(name);
    
            dbo.collection(collection).updateOne(what, {$set: query}, (err, res) => {
                if(err){throw err;}
                db.close();
                cb(res.result);
            });
        });  
    }

    /*exports.unset = (id, fields, cb) => {
        mongodb.connect(url, options, (err, db) => {
            if(err){throw err;}
            let dbo = db.db(name);
    
            dbo.collection(table).update({id: id}, {$unset: fields}, (err, res) => {
                if(err){throw err;}
                db.close();
                cb(res.result);
            });
        });   
    };
    
    
    
    exports.replace = (id, data, cb) => {
        mongodb.connect(url, options, (err, db) => {
            if(err){throw err;}
            let dbo = db.db(name);
    
            dbo.collection(table).replaceOne({id: id}, data, (err, res) => {
                if(err){throw err;}
                db.close();
                cb(res.result);
            });
        });  
    };*/
}

module.exports = Database;