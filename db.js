'use strict';

const mongodb = require('mongodb').MongoClient;//3.1.6
const url = 'mongodb://localhost:27017/';
const options = {useNewUrlParser:true};
const name = 'vod';

// FIXA: findAndModify
class Database {
    find(collection, query){
        return new Promise((resolve) => {
            mongodb.connect(url, options, (err, db) => {
                if(this.error(err)){resolve(null); return;
                }
                db.db(name).collection(collection).findOne(query, (err, res) => {
                    db.close();
                    if(this.error(err)){resolve(null); return;}
                    resolve(res);
                });
            });
        });
    }

    find_all(collection, query){
        return new Promise((resolve) => {
            mongodb.connect(url, options, (err, db) => {
                if(this.error(err)){resolve(null); return;}
                db.db(name).collection(collection).find(query).toArray((err, res) => {
                    db.close();
                    if(this.error(err)){resolve(null); return;}
                    resolve(res);
                });
            });
        });
    }

    insert(collection, query){
        return new Promise((resolve) => {
            mongodb.connect(url, options, (err, db) => {
                if(this.error(err)){resolve(null); return;}
                db.db(name).collection(collection).insertOne(query, (err, res) => {
                    db.close();
                    if(this.error(err)){resolve(null); return;}
                    resolve(this.parse_results(res.result));
                });
            });
        });
    }

    insert_with_unique_id(collection, query, random, key){
        return new Promise((resolve) => {
            mongodb.connect(url, options, (err, db) => {
                if(this.error(err)){resolve(null); return;}
                
                let dbo = db.db(name);
                let id = random();

                dbo.collection(collection).findOne({[key]: id}, (err, res) => {
                    if(this.error(err)){resolve(null); return;}
                    if(res == null){
                        query.id = id;
                        dbo.collection(collection).insertOne(query, (err, res) => {
                            db.close();
                            if(this.error(err)){resolve(null); return;}
                            resolve(this.parse_results(res.result), {id: id});
                        });
                    }else {
                        db.close();
                        this.insert_with_unique_id(collection, query, random, cb);
                    }
                });
            });
        });
    }

    edit(collection, target, query, forbidden_keys){
        return new Promise((resolve) => {
            mongodb.connect(url, options, (err, db) => {
                if(this.error(err)){resolve(null); return;}
                if(forbidden_keys === undefined){
                    forbidden_keys = ['_id'];    
                }else {
                    forbidden_keys.push('_id');
                }
                query = this.remove_keys(forbidden_keys, query);
                //query = this.remove_keys(['id', '_id'], query);
                db.db(name).collection(collection).updateOne(target, {$set: query}, (err, res) => {
                    db.close();
                    if(this.error(err)){resolve(null); return;}
                    resolve(this.parse_results(res.result));
                });
            });
        });  
    }

    unset(collection, target, query){
        return new Promise((resolve) => {
            mongodb.connect(url, options, (err, db) => {
                if(this.error(err)){resolve(null); return;}
                query = this.remove_keys(['id', '_id'], query);
                db.db(name).collection(collection).updateOne(target, {$unset: query}, (err, res) => {
                    db.close();
                    if(this.error(err)){resolve(null); return;}
                    resolve(this.parse_results(res.result));
                });
            });
        });   
    }

    remove(collection, query){
        return new Promise((resolve) => {
            mongodb.connect(url, options, (err, db) => {
                if(this.error(err)){resolve(null); return;}
                db.db(name).collection(collection).deleteOne(query, (err, res) => {
                    db.close();
                    if(this.error(err)){resolve(null); return;}
                    resolve(this.parse_results(res.result));
                });
            });
        });
    }

    count(collection, query){
        return new Promise(resolve => {
            mongodb.connect(url, options, (err, db) => {
                if(this.error(err)){resolve(null); return;}
                db.db(name).collection(collection).countDocuments(query, (err, n) => {
                    db.close();
                    if(this.error(err)){resolve(null); return;}
                    resolve(n);
                });
            });
        });
    }

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

    remove_keys(keys, target){
        for(let key of keys){
            if(target[key] !== undefined){
                delete target[key];
            }
        }
        return target;
    }
}

module.exports = Database;