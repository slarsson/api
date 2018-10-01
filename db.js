'use strict';

const mongodb = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const options = {useNewUrlParser:true};
const name = 'vod';

class Database {
    constructor(){}

    error(e){
        try {
            if(e){throw e;}
        }catch(err){
            console.log(err);
            return true;
        }
        return false;
    }

    parse_results(res){
        if(res.ok == 0){return {status: false, error: "db error"};}
        if(res.n >= 1){
            if(res.nModified != null){
                if(res.nModified == 0){
                    return {status: true, msg: "records up to date, no changes"};
                }else {
                    return {status: true};
                }
            }else {
                return {status: true};
            }
        }else {
            return {status: false, error: "no target found"};
        }
    }

    random_id(){
        let id = "";
        let data = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let n = Math.floor(Math.random() * 5) + 10;

        for(let i = 0; i < n; i++){
            id += data.charAt(Math.floor(Math.random() * data.length));
        } 
        return id;
    }

    remove_keys(keys, target){
        for(let key of keys){
            if(target[key] !== undefined){
                delete target[key];
            }
        }
        return target;
    }

    find(collection, query, cb){
        mongodb.connect(url, options, (err, db) => {
            if(this.error(err)){cb(null); return;}
            db.db(name).collection(collection).findOne(query, (err, res) => {
                db.close();
                if(this.error(err)){cb({status: false, error: "bad input"}); return;}
                cb(res);
            });
        });
    }

    find_all(collection, query, cb){
        mongodb.connect(url, options, (err, db) => {
            if(this.error(err)){cb(null); return;}
            db.db(name).collection(collection).find(query).toArray((err, res) => {
                db.close();
                if(this.error(err)){cb({status: false, error: "bad input"}); return;}
                cb(res);
            });
        });
    }

    insert(collection, query, cb){
        mongodb.connect(url, options, (err, db) => {
            if(this.error(err)){cb(null); return;}
            
            let dbo = db.db(name);
            let id = this.random_id();

            dbo.collection(collection).findOne({id: id}, (err, res) => {
                if(this.error(err)){cb(null); return;}
                if(res == null){
                    query.id = id;
                    dbo.collection(collection).insertOne(query, (err, res) => {
                        db.close();
                        if(this.error(err)){cb(null); return;}
                        cb(this.parse_results(res.result), {id: id});
                    });
                }else {
                    db.close();
                    this.insert(collection, query, cb);
                }
            });
        });
    }

    edit(collection, target, query, cb){
        mongodb.connect(url, options, (err, db) => {
            if(this.error(err)){cb(null); return;}
            query = this.remove_keys(['id', '_id'], query);
            db.db(name).collection(collection).updateOne(target, {$set: query}, (err, res) => {
                db.close();
                if(this.error(err)){cb({status: false, error: "empty input"}); return;}
                cb(this.parse_results(res.result));
            });
        });  
    }

    unset(collection, target, query, cb){
        mongodb.connect(url, options, (err, db) => {
            if(this.error(err)){cb(null); return;}
            query = this.remove_keys(['id', '_id'], query);
            db.db(name).collection(collection).updateOne(target, {$unset: query}, (err, res) => {
                db.close();
                if(this.error(err)){cb({status: false, error: "empty input"}); return;}
                cb(this.parse_results(res.result));
            });
        });   
    }

    remove(collection, query, cb){
        mongodb.connect(url, options, (err, db) => {
            if(this.error(err)){cb(null); return;}
            db.db(name).collection(collection).deleteOne(query, (err, res) => {
                db.close();
                if(this.error(err)){cb({status: false, error: "bad query"}); return;}
                cb(this.parse_results(res.result));
            });
        });
    }
}

module.exports = Database;