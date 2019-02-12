'use strict';

const Rank = require('./rank.js');
const Bracket = require('./bracket.js');

class Progress {
    constructor(tournament){
        this.tournament = tournament;
        
        this.r4 = [
            [1, 0], [null, null], [1, 1]
        ];
        
        this.r4_pos = [
            [0, 0], [0, 1], [1, 0], [1, 1]
        ];
        
        this.r8 = [
            [2, 0], [2, 1], [3, 0], 
            [null, null], 
            [3, 1], [4, 0], [4, 1]
        ];

        this.r8_pos = [
            [0, 0], [0, 1], [1, 0], [1, 1],
            [5, 0], [5, 1], [6, 0], [6, 1]
        ];

        this.r16 = [
            [4, 0], [4, 1], [5, 0], [5, 1], 
            [6, 0], [6, 1], 
            [7, 0], 
            [null, null],
            [7, 1],
            [8, 0], [8, 1], 
            [9, 0], [9, 1], [10, 0], [10, 1]
        ];

        this.r16_pos = [
            [0, 0], [0, 1], [1, 0], [1, 1],
            [2, 0], [2, 1], [3, 0], [3, 1],
            [11, 0], [11, 1], [12, 0], [12, 1],
            [13, 0], [13, 1], [14, 0], [14, 1]
        ];
    }

    // LÄGG TILL SÅ ATT DEN UPDATERAR this.tournament
    // LÄGG TILL completed:true NÄR MATCH SPELAD!!!
    // lägger till resultat för en match + skapar nästa match
    bracket(id, r1, r2){
        const min = 0, max = 999;
        if(r1 == r2 || r1 < min || r2 < min || r1 > max || r2 > max){return false;}    
        if(this.tournament.bracket[id] == null){return false;}
        if(this.tournament.bracket[id].teams[0] == null || this.tournament.bracket[id].teams[1] == null){return false;}
 
        let r;
        const n = this.tournament.bracket.length+1;
        if(n == 4){r = this.r4;} else
        if(n == 8){r = this.r8;} else
        if(n == 16){r = this.r16;}

        if(this.tournament.bracket[id].status == true){
            if(r[id][0] !== null){
                if(this.tournament.bracket[r[id][0]].status == true){
                    return false;
                }
            }
        }

        let output = {
            ['bracket.' + id + '.results.0']: r1,
            ['bracket.' + id + '.results.1']: r2,
            ['bracket.' + id + '.edit']: new Date().getTime(),
            ['bracket.' + id + '.status']: true
        };

        let index;
        if(r1 > r2){index = 0;}else {index = 1;}

        if(r[id][0] != null){
            // error om 'finalen' saknar lag, borde inte vara möjligt??
            let i;
            if(r[id][1] == 0){i = 1;}else {i = 0;}
            if(this.tournament.bracket[r[id][0]].teams[i] === false){
                if(r[r[id][0]][0] !== null){
                    output['bracket.' + r[id][0] + '.results.' + r[id][1]] = false;
                    output['bracket.' + r[id][0] + '.status'] = true;
                    output['bracket.' + r[r[id][0]][0] + '.teams.' + r[r[id][0]][1]] = this.tournament.bracket[id].teams[index];
                }
            }

            output['bracket.' + r[id][0] + '.teams.' + r[id][1]] = this.tournament.bracket[id].teams[index];
            output['bracket.' + r[id][0] + '.placeholder.' + r[id][1]] =  null;
        }


        // kolla om gruppen ska stängas..
        // bra sätt??
        let _break = [false, false];
        find_group:
        for(let i = 0; i < this.tournament.groups.length; i++){
            for(let j = 0; j < this.tournament.groups[i].teams.length; j++){
                if(this.tournament.groups[i].teams[j] == this.tournament.bracket[id].teams[0]){
                    output['groups.' + i + '.completed'] = true;
                    _break[0] = true;
                }

                if(this.tournament.groups[i].teams[j] == this.tournament.bracket[id].teams[1]){
                    output['groups.' + i + '.completed'] = true;
                    _break[1] = true;
                }

                if(_break[0] && _break[1]){
                    break find_group;
                }
            }
        }
 
        return output;
    }

    // muterar 'bracket', n = vilket storlek, 4, 8, 16
    // fyller i tomma matcher
    empty(bracket, n){
        let r;
        if(n == 4){r = this.r4;} else
        if(n == 8){r = this.r8;} else
        if(n == 16){r = this.r16;}

        for(let i = 0; i < bracket.length; i++){
            if(bracket[i].teams[0] === false && bracket[i].teams[1] === false && bracket[i].status === false){
                if(r[i][0] == null){continue;}
                bracket[i].status = true;
                bracket[r[i][0]].teams[r[i][1]] = false;
                bracket[r[i][0]].placeholder[r[i][1]] = 'n/a';
                i = 0;
                continue;
            }
        }

        const check = (i) => {
            let index = null;
            if(bracket[i].teams[0] === false && typeof bracket[i].teams[1] === 'number'){
                index = 1;
            }

            if(bracket[i].teams[1] === false && typeof bracket[i].teams[0] === 'number'){
                index = 0;
            }

            if(index !== null && r[i][0] !== null){
                bracket[r[i][0]].teams[r[i][1]] = bracket[i].teams[index];
                bracket[r[i][0]].placeholder[r[i][1]] = null;
                bracket[i].status = true;
            }
        }

        const l = Math.floor(bracket.length/2);
        for(let i = 0; i < l; i++){check(i);}
        for(let i = bracket.length-1; i > l; i--){check(i);}
        return bracket;
    }

    // returnerar ändringar + lägger till ändringar i objektet
    // tomma matcher -> lägger till nästa 
    add_group_winners_to_bracket(id){
        let r_size, r;
        let n = this.tournament.bracket.length + 1;
        if(n == 4){r_size = this.r4; r = this.r4_pos;} else
        if(n == 8){r_size = this.r8; r = this.r8_pos;} else
        if(n == 16){r_size = this.r16; r = this.r16_pos;}

        if(this.tournament.teams.length < 16){n = 8;}
        if(this.tournament.teams.length < 8){n = 4;}

        let x = Bracket.get_groups_size(this.tournament.teams.length, this.tournament.groups.length);
        let {n_qualify_group: size} = Bracket.get_qualify_size(this.tournament.groups.length, x.n_per_group, n);

        let updates = {};

        for(let i = 0; i < size; i++){
            for(let j = 0; j < this.tournament.position.length; j++){
                if(this.tournament.position[j][0] == i && this.tournament.position[j][1] == id){
                    updates = {
                        ...updates, 
                        ...this.add_to_bracket(
                            this.tournament.groups[id].teams[this.tournament.groups[id].rank[i]], 
                            j, 
                            r, 
                            r_size
                        )
                    };
                }
            }
        }

        return updates;
    }

    groups_completed(current = -1){
        for(let i = 0; i < this.tournament.games.length; i++){
            if(this.tournament.games[i].status == false && this.tournament.games[i].group != current){
                return false;
            }
        }
        return true;
    }

    best_of_the_rest(){
        let r_size, r;
        let n = this.tournament.bracket.length + 1;
        if(n == 4){r_size = this.r4; r = this.r4_pos;} else
        if(n == 8){r_size = this.r8; r = this.r8_pos;} else
        if(n == 16){r_size = this.r16; r = this.r16_pos;}

        if(this.tournament.teams.length < 16){n = 8;}
        if(this.tournament.teams.length < 8){n = 4;}
        
        let targets = [];
        let updates = {};

        for(let i = 0; i < this.tournament.position.length; i++){
            if(this.tournament.position[i][0] == 100){
                targets.push(i);
            }
        }
        
        const list = new Rank(this.tournament).all([]);
        
        for(let i = 0, j = (n - targets.length); i < targets.length; i++, j++){
            updates = {
                ...updates, 
                ...this.add_to_bracket(list[j], targets[i], r, r_size)
            }; 
        }

        return updates;
    }


    // team = lag index, pos = position i pos_array
    add_to_bracket(team, pos, pos_array, prog_array){
        let updates = {};
        
        this.tournament.bracket[pos_array[pos][0]].teams[pos_array[pos][1]] = team;
        this.tournament.bracket[pos_array[pos][0]].placeholder[pos_array[pos][1]] = null;
        updates['bracket.' + pos_array[pos][0] + '.teams.' + pos_array[pos][1]] = team;
        updates['bracket.' + pos_array[pos][0] + '.placeholder.' + pos_array[pos][1]] = null;

        let prev = pos_array[pos][0];
        let index = pos_array[pos][1];

        while(prev != null){
            let second_index = 0;
            if(index == 0){second_index = 1;}
            
            if(this.tournament.bracket[prev].teams[second_index] === false){
                this.tournament.bracket[prog_array[prev][0]].teams[prog_array[prev][1]] = team;
                this.tournament.bracket[prog_array[prev][0]].placeholder[prog_array[prev][1]] = null;                           
                updates['bracket.' + prog_array[prev][0] + '.teams.' + prog_array[prev][1]] = team;
                updates['bracket.' + prog_array[prev][0] + '.placeholder.' + prog_array[prev][1]] = null;
                        
                index = prog_array[prev][1];
                prev = prog_array[prev][0];
                
                continue;
            }
            break;
        }

        return updates;
    }

}

module.exports = Progress;