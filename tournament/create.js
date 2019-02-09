'use strict';

const _test = require('./bracket.js');

class Create {
    constructor(creator, data, teams){
        this.creator = creator;
        this.data = data;
        this.teams = teams;
    }

    generate(){
        const groups = this.groups(this.data.group, this.teams.length);
        if(!groups){
            return {data: null, status: false, error: "atleast two teams per group"};
        }

        const test = _test.create(groups.length, this.teams.length, this.data.type);
        if(!test){
            return {data: null, status: false, error: "meh.. can't create that :("};
        }

        const bracket = this.bracket(this.data.type, groups.length, test);
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
            position: test,
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
            let rank = [];

            let j = 0;
            for(; j < teams_per_group; j++){
                group.push(teams[counter]); counter++;
                rank.push(j);
            }
            if(i < overflow){
                group.push(teams[counter]); counter++;
                rank.push(j);
            }

            let points = [];
            let stats = [];
            for(let k = 0; k < group.length; k++){
                points.push(0);
                stats.push([0, 0, 0, 0, 0, 0]);
            }

            output.push({teams: group, points: points, stats: stats, rank: rank, completed: false});
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

    bracket(type, number_of_groups, positions){
        const size = [3, 7, 15];
        const pos = [1, 2, 4];
        let output = [];
        let p = 0;

        if(type < 0 || type > size.length || number_of_groups > (size[type]+1)){return false;}
        for(let i = 0; i < size[type]; i++){
            let teams = [null, null];
            let placeholder =  ['tbd', 'tbd'];
            
            if(i < pos[type] || i >= (size[type] - pos[type])){
                if(positions[p][0] == -1){
                    teams[0] = false;
                    placeholder[0] = 'n/a';
                }
                if(positions[p + 1][0] == -1){
                    teams[1] = false;
                    placeholder[1] = 'n/a';
                }
                
                output.push({
                    teams: teams, 
                    results: [null, null], 
                    status: false,
                    placeholder: placeholder,
                    edit: null
                });

                p += 2;
            }else {
                output.push({
                    teams: teams, 
                    results: [null, null], 
                    status: false,
                    placeholder: placeholder, 
                    edit: null
                });
            }   
        }

        return output;
    }
}

module.exports = Create;