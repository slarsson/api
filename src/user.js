'use strict';

const Library = require('../lib.js');
const salt = 'nm/&(xx2d329738d2b36#';

class User extends Library {
    constructor(req, res, query){
        super(req, res);
        this.query = this.format(query);
    }

    async index(){
        const session = await this.authenticate();
        if(!session){this.render({}, 401); return;}
        if(this.method == 'GET'){this.self(session); return;}
        if(this.method == 'POST'){this.add(session); return;}
        if(this.method == 'PATCH'){this.update(session); return;}
        if(this.method == 'DELETE'){this.remove(session); return;}
        this.render({status: false}, 404);
    }

    self(user){
        this.render({
            username: user.username,
            group: user.group
        });
    }

    async add(user){
        if(!(user.group == 0 || user.group == 1)){this.render({}, 401); return;}

        const input = await this.post();
        if(!this.isset(input, ["username", "password"])){
            this.render({status:false, error: "asdf"}); return;
        }

        const username = input.username.trim();
        if(username.match(/[^a-zA-Z0-9-]|-{2,}/)){
            this.render({status:false, error: "asdf"}); return;
        }

        if((await this.db.count('users', {username: username})) != 0){
            this.render({status:false, error: "asdf"}); return;
        }

        const data = {
            username: username,
            password: this.hash(input.password, (username+salt)),
            group: 2 // default!
        }

        this.render(await this.db.insert('users', data));
    }

    async update(user){
        const allowed = ["email", "data"];
        let changes = {};
        let password_required = true;
        
        if(this.query.username != null){
            if(!(user.group == 0 || user.group == 1)){this.render({}, 401); return;}
            
            const target = await this.db.find('users', {username: this.query.username});
            if(target == null || (user.group == 1 && (target.group == 1 || target.group == 0))){
                this.render({status: false, error: "my error"}); return;
            }

            user = target;
            password_required = false;
        }
        
        if(this.query.password != null){
            if(password_required){
                if(this.query.current_password != null){
                    const current = this.hash(this.query.current_password, (user.username+salt));
                    changes.password = this.hash(this.query.password, (user.username+salt));
                    if(current != user.password){
                        this.render ({error: "passwords did not match"}); return;
                    }
                }else {
                    this.render({status:false, error: "current_password missing"}); return;
                }  
            }else {
                changes.password = this.hash(this.query.password, (user.username+salt));
            }   
        }

        if(this.query.group != null){
            if(!password_required && (this.query.group == 1 || this.query.group == 2)){
                changes.group = this.query.group;
            }else {
                this.render({status: false, error: "nah.."}); return;
            }
        }

        for(const item of allowed){
            if(this.query[item] != null){
                changes[item] = this.query[item];
            }
        }

        if(Object.keys(changes).length === 0){
            this.render({status: false, error: "nothing could be changed(?)"}); return;
        }
        this.render(await this.db.edit('users', {username: user.username}, changes));
    }

    async remove(user){
        if(!(user.group == 0 || user.group == 1)){this.render({}, 401); return;}
 
        if(this.query.username == null){
            this.render({status: false, error: "empty fields"}); return;
        }

        if(this.query.username == user.username){
            this.render({status: false, error: "you can't remove yourself.."}); return;
        }

        const target = await this.db.find('users', {username: this.query.username});
        if(target == null){
            this.render({status: false, error: "user not found"}); return;
        }
        
        if(target.group == 0 || (user.group == 1 && target.group == 1)){
            this.render({status: false, error: "nej."}, 401); return;
        }

        this.render(await this.db.remove('users', {username: this.query.username}));
    }
};

module.exports = User;