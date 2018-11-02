'use strict';

const SIZE = [3, 7, 15];

class Create {
    constructor(creator, data, teams){
        this.creator = creator;
        this.data = data;
        //this.teams = ["Arsenal", "Boden BK", "IFK Norrköping", "Manchester United", "FC Barcelona", "KHK", "AIK", "Chelsea", "Brommapojkarna", "Luleå Hockey"];
        this.teams = teams;
    }

    generate(){
        const groups = this.groups(this.data.group, this.teams.length);
        if(!groups){
            return {data: null, status: false, error: "my error"};
        }

        const bracket = this.bracket(this.data.type, groups.length);
        if(!bracket){
            return {data: null, status: false, error: "bad input, to many groups or type does not exist"};
        }

        return {data: {
            name: this.data.name,
            text: this.data.text,
            created: new Date().getTime(),
            owners: [this.creator.username],
            teams: this.teams,
            groups: groups,
            games: this.games(this.data.rounds, groups),
            bracket: bracket,
        }, status: true, error: null};
    }

    // n: max antal per grupp
    // total: antalet lag
    groups(n, total){
        if(n < 2 || total < 2){return false;}
        let output = [];
        let teams = [];

        for(let i = 0; i < total; i++){teams.push(i);}
        for(let i = (total-1); i >= 0; i--){
            let r = Math.floor(Math.random()*i);
            [teams[i], teams[r]] = [teams[r], teams[i]];
        }

        const number_of_groups = Math.ceil(total/n);
        const teams_per_group = Math.floor(total/number_of_groups);
        const overflow = total % number_of_groups;

        if(teams_per_group == 1){return false;}//kan inte ha ett lag i en grupp

        let counter = 0;
        for(let i = 0; i < number_of_groups; i++){
            let group = [];
            for(let j = 0; j < teams_per_group; j++){
                group.push(teams[counter]); counter++;
            }
            if(i < overflow){
                group.push(teams[counter]); counter++;
            }

            let points = [];
            for(let j = 0; j < group.length; j++){
                points.push(0);
            }

            output.push({teams: group, points: points, completed: false});
        }
        return output;
    }

    games(rounds, groups){
        let output = [];
        for(let i = 0; i < groups.length; i++){
            for(let j = 0; j < groups[i].teams.length-1; j++){
                for(let k = (j+1); k < groups[i].teams.length; k++){
                    let a, b;
                    if(Math.floor(Math.random()*2) == 0){
                        a = j; b = k;
                    }else {
                        a = k; b = j;
                    }
                    for(let r = 0; r < rounds; r++){
                        output.push({
                            teams: [groups[i].teams[a], groups[i].teams[b]],
                            results: [null, null],
                            group: i,
                            status: false,
                            edit: null
                        });
                        [a , b] = [b, a];
                    }
                }
            }
        }
        return output;
    }

    bracket(type, number_of_groups){
        if(type < 0 || type > SIZE.length || number_of_groups > (SIZE[type]+1)){return false;}
        let output = [];
        for(let i = 0; i < SIZE[type]; i++){
            output.push({
                teams: [null, null], 
                results: [null, null], 
                status: false,
                placeholder: ['tbd', 'tbd'], 
                edit: null
            });
        }
        return output;
    }
}

module.exports = Create;