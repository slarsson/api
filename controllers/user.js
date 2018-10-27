'use strict';

const LIBRARY = require('../lib.js');

class User extends LIBRARY {
    constructor(req, res, query){
        super(req, res);
        this.query = this.format(query);
    }

    async index(){
        const session = await this.authenticate();
        if(!session){this.render({}, 401); return;}
        if(this.method == 'GET'){this.info(session); return;}
        if(this.method == 'POST'){this.add(session); return;}
        if(this.method == 'PATCH'){this.update(session); return;}
        if(this.method == 'DELETE'){this.remove(session); return;}
        this.render({status: false});
    }

    info(user){
        this.render({
            username: user.username,
            group: user.group
        });
    }

    async add(user){
        if(![0].includes(user.group)){this.render({}, 401); return;}

        const input = await this.post();
        if(!this.isset(input, ["username", "password"])){
            this.render({error: "asdf"}); return;
        }

        const username = input.username.trim();
        if(username.match(/[^a-zA-Z0-9-]|-{2,}/)){
            this.render({error: "asdf"}); return;
        }

        if((await this.db.count('users', {username: username})) != 0){
            this.render({error: "asdf"}); return;
        }
        
        const data = {
            username: username,
            password: this.hash(input.password, (username+'nm/&(xx2d329738d2b36#')),
            group: 1
        }

        this.render(await this.db.insert('users', data));
    }

    // lägg till det som ska uppdateras..
    async update(user){
        if(!this.isset(this.query, ["password", "new_password"])){
            this.render ({error: "nej."}); return;
        }

        const password = this.hash(this.query.password, (user.username+'nm/&(xx2d329738d2b36#'));
        const new_password = this.hash(this.query.new_password, (user.username+'nm/&(xx2d329738d2b36#'));
        if(password != user.password){
            this.render ({error: "passwords did not match"}); return;
        }

        this.render(await this.db.edit('users', {username: user.username}, {password: new_password}));
    }

    async remove(user){
        if(![0].includes(user.group)){this.render({}, 401); return;}
   
        if(this.query.username == undefined){
            this.render({error: "empty fields"}); return;
        }

        if(this.query.username == user.username){
            this.render({error: "you can't remove yourself.."}); return;
        }

        const target = await this.db.find('users', {username: this.query.username});
        if(target == null){this.render({error: "user not found"}); return;}
        if(target.group == 0){this.render({error: "my error"}); return;}

        this.render(await this.db.remove('users', {username: this.query.username}));
    }
};

module.exports = User;