'use strict';

const LIBRARY = require('../lib.js');

class Tournament extends LIBRARY {
    constructor(req, res, query){
        super(req, res);
        this.query = query;
    }

    index(){
        const session = await this.authenticate();
        if(!session){this.render({}, 401); return;}
        //if(this.method == 'GET'){this.info(session); return;}
        if(this.method == 'POST'){this.create(session); return;}
        this.render({status: false}, 404);
    }

    async create(user){
        const teams = ["Arsenal", "Boden BK", "IFK Norrköping", "Manchester United", "FC Barcelona", "KHK", "AIK", "Chelsea", "Brommapojkarna", "Luleå Hockey"];



        let tournament = {
            name: "test",
            owners: [user.username],
            teams: teams,
            groups: [
                [0, 1, 2, 3, 4],
                [5, 6, 7, 8, 9]
            ],
            games: [],
            bracket: []
        };
    }

}

module.exports = Tournament;