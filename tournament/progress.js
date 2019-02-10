'use strict';

const Rank = require('./rank.js');
const Bracket = require('./bracket.js');

class Progress {
    constructor(tournament){
        this.tournament = tournament;
        this.r4 = [[1, 0], [null, null], [1, 1]];
        this.r8 = [[2, 0], [2, 1], [3, 0], [null, null], [3, 1], [4, 0], [4, 1]];
        this.r16 = [[4, 0], [4, 1], [5, 0], [5, 1], [6, 0], [6, 1], [7, 0], [null, null], [7, 1], [8, 0], [8, 1], [9, 0], [9, 1], [10, 0], [10, 1]];
        this.rank = new Rank(tournament);
    }

    // // kollar om gruppen är 'färdig' och vilka som går vidare
    // // return false, om gruppen ej är färdig
    // // eller en lista på vilka som gått vidare
    // // boolean = false => ger en lista på vinnare i gruppen
    // complete(id, boolean){
    //     for(const item of this.tournament.games){
    //         if(item.status == false && item.group == id){
    //             return false;
    //         }
    //     }
        
    //     if(boolean){return true;}
    //     return this.group_winners(id);
    // }

    // // genererar en lista på vilka som går vidare
    // group_winners(id){
    //     const list = this.rank.group(id);
    //     const number_of_entries = this.tournament.bracket.length+1;
    //     const number_of_groups = this.tournament.groups.length;
    //     let n = Math.floor(number_of_entries/number_of_groups);
        
    //     let min = Infinity;
    //     for(const item of this.tournament.groups){
    //         if(item.teams.length < min){min = item.teams.length;}
    //     }
    //     if(n > min){n = min;}

    //     let output = [];
    //     for(let i = 0; i < n; i++){
    //         if(list[i] == null){break;}
    //         output.push({team: list[i], group: id, pos: i});
    //     }
    //     return output;
    // }

    // // bestämmer de 'sista' platserna (bästa 3a osv..), 
    // // när grupper/bracket inte har samma 'storlek'
    // complete_bracket(group_winners_list){
    //     const size = (this.tournament.bracket.length+1);
    //     const missing = size - group_winners_list.length;
    //     if(missing == 0){return group_winners_list;}
    
    //     const del = group_winners_list.map((item) => {return item.team;});
    //     const rest = this.rank.all(del);
        
    //     let n = -1;
    //     for(let i = 0; i < missing; i++){
    //         if(rest[i] != null){
    //             group_winners_list = group_winners_list.concat({team: rest[i], group: -1, pos: n});
    //             n--;
    //         }else {
    //             group_winners_list = group_winners_list.concat(null);
    //         }
    //     }
    //     return group_winners_list;
    // }

    // // skapar en fullständig lista, om alla grupper är 'färdiga' 
    // get_bracket(id){
    //     let out = [];
    //     let i = 0;

    //     for(const item of this.tournament.groups){
    //         if(i != id && item.completed == false){
    //             console.log("alla grupper ej klara!");
    //             return false;
    //         }
    //         out = out.concat(this.group_winners(i));
    //         i++;
    //     }
    //     return this.complete_bracket(out);
    // }

    // // fungerare det här ens!?!?!?
    // test(list){
    //     let empty = 0;
    //     let input = list.filter((item) => {
    //         if(item != null){return item;}else {empty++;}
    //     })
        
    //     for(let i = 0; i < input.length-1; i++){
    //         for(let j = i+1; j < input.length; j++){
    //             if(input[j].pos < 0){input[j].pos = (-100)*input[j].pos;}// efterbliven lösning..
    //             if(input[i].pos < 0){input[i].pos = (-100)*input[i].pos;}
    //             if(input[j].pos < input[i].pos){
    //                 [input[j], input[i]] = [input[i], input[j]];
    //             }
    //         }
    //     }
    //     for(let i = 0; i < empty; i++){input.push(null);}

    //     let top = input.slice(0, (input.length/2));
    //     let bottom = input.slice((input.length/2), input.length).reverse();

    //     let games = [];
    //     for(let i = 0; i < (input.length/2); i++){
    //         let index;
    //         if(top[i] != null && bottom[i] != null){
    //             if(top[i].group == bottom[i].group){
    //                 if(bottom[i].group > -1){
    //                     let stop = true;
    //                     let k = 1;
    //                     while(stop){
    //                         if((k + i - 1) < (input.length/2 - 1)){
    //                             if(bottom[i].group != bottom[i+k].group || bottom[i].group == -1){
    //                                 [bottom[i], bottom[i+k]] = [bottom[i+k], bottom[i]];
    //                                 stop = false;
    //                             }
    //                             k++;
    //                         }else {
    //                             stop = false;
    //                         }
    //                     }
    //                 }
    //             }
    //         }

    //         games.push(top[i]);
    //         games.push(bottom[i]);
    //     }
        
    //     let output = Array(games.length);
    //     let a = 0;
    //     let b = games.length/2;

    //     for(let i = 0; i < games.length; i+=4){
    //         output[a] = games[i];
    //         output[a + 1] = games[i + 1];
    //         output[a + b] = games[i + 2];
    //         output[a + b + 1] = games[i + 3];
    //         a+=2;
    //     }
        
    //     return output;
    //     //console.log(output);
    //     //return games;
    // }

    // // lägger till 'listan' till bracket, bor göras på annat sätt asså..
    // populate_bracket(list){
    //     list = this.test(list);// test..
        
    //     let r;
    //     const r4 = [0, 1, 4, 5];
    //     const r8 = [0, 1, 2, 3, 10, 11, 12, 13];
    //     const r16 = [0, 1, 2, 3, 4, 5, 6, 7, 22, 23, 24, 25, 26, 27, 28, 29];
    
    //     const n = this.tournament.bracket.length+1;
    //     if(n == 4){r = r4;} else
    //     if(n == 8){r = r8;} else
    //     if(n == 16){r = r16;}

    //     let x = 0;
    //     let y = 0;
    //     for(let i = 0; i < this.tournament.bracket.length; i++){
    //         if(r.includes(x)){
    //             for(let j = 0; j < 2; j++){
    //                 if(list[y] == null){
    //                     this.tournament.bracket[i].teams[j] = false;
    //                     this.tournament.bracket[i].placeholder[j] = 'n/a';
    //                 }else {
    //                     this.tournament.bracket[i].teams[j] = list[y].team;
    //                     this.tournament.bracket[i].placeholder[j] = null;
    //                 }
    //                 y++;
    //             }
    //         }
    //         x += 2;
    //     }
    //     return this.empty(this.tournament.bracket, n);
    // }
    
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
        const r4 = [
            [0, 0], [0, 1], [1, 0], [1, 1]
        ];
        
        const r8 = [
            [0, 0], [0, 1], [1, 0], [1, 1],
            [5, 0], [5, 1], [6, 0], [6, 1]
        ];
        
        const r16 = [
            [0, 0], [0, 1], [1, 0], [1, 1],
            [2, 0], [2, 1], [3, 0], [3, 1],
            [11, 0], [11, 1], [12, 0], [12, 1],
            [13, 0], [13, 1], [14, 0], [14, 1]
        ];

        let r_size, r;
        let n = this.tournament.bracket.length + 1;
        if(n == 4){r_size = this.r4; r = r4;} else
        if(n == 8){r_size = this.r8; r = r8;} else
        if(n == 16){r_size = this.r16; r = r16;}

        if(this.tournament.teams.length < 16){n = 8;}
        if(this.tournament.teams.length < 8){n = 4;}

        let x = Bracket.get_groups_size(this.tournament.teams.length, this.tournament.groups.length);
        let {n_qualify_group: size} = Bracket.get_qualify_size(this.tournament.groups.length, x.n_per_group, n);

        let updates = {};

        for(let i = 0; i < size; i++){
            for(let j = 0; j < this.tournament.position.length; j++){
                if(this.tournament.position[j][0] == i && this.tournament.position[j][1] == id){
                    this.tournament.bracket[r[j][0]].teams[r[j][1]] = this.tournament.groups[id].teams[this.tournament.groups[id].rank[i]];
                    this.tournament.bracket[r[j][0]].placeholder[r[j][1]] = null;
                    updates['bracket.' + r[j][0] + '.teams.' + r[j][1]] = this.tournament.groups[id].teams[this.tournament.groups[id].rank[i]];
                    updates['bracket.' + r[j][0] + '.placeholder.' + r[j][1]] = null;

                    let prev = r[j][0];
                    let index = r[j][1];

                    while(prev != null){
                        let second_index = 0;
                        if(index == 0){second_index = 1;}
                        if(this.tournament.bracket[prev].teams[second_index] === false){
                            this.tournament.bracket[r_size[prev][0]].teams[r_size[prev][1]] = this.tournament.groups[id].teams[this.tournament.groups[id].rank[i]];
                            this.tournament.bracket[r_size[prev][0]].placeholder[r_size[prev][1]] = null;
                            updates['bracket.' + r_size[prev][0] + '.teams.' + r_size[prev][1]] = this.tournament.groups[id].teams[this.tournament.groups[id].rank[i]];
                            updates['bracket.' + r_size[prev][0] + '.placeholder.' + r_size[prev][1]] = null;
                        
                            index = r_size[prev][1];
                            prev = r_size[prev][0];
                            
                            continue;
                        }
                        break;
                    }
                    break;
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
        console.log("lägg till resten...");
    }

}

module.exports = Progress;