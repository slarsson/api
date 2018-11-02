//const quarter_finals = [8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, null, null, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21];
//const entry_quater = [[0, 2, 4, 6], [22, 24, 26, 28], [1, 3, 5, 7], [23, 25, 27, 29]];      
//const semi_finals = [4, 4, 5, 5, 6, 6, null, null, 7, 7, 8, 8, 9, 9]; 
//const entry_semi = [[0, 2], [10, 12], [1, 3], [11, 13]];

'use strict';

class Progress {
    constructor(tournament){
        this.tournament = tournament;
    }

    // kollar om gruppen är 'färdig' och vilka som går vidare
    // return false, om gruppen ej är färdig
    // eller en lista på vilka som gått vidare
    // boolean = false => ger en lista på vinnare i gruppen
    complete(id, boolean){
        for(const item of this.tournament.games){
            if(item.status == false && item.group == id){
                console.log("group not completed..");
                return false;
            }
        }
        
        if(boolean){return true;}
        return this.group_winners(id);
    }

    // genererar en lista på vilka som går vidare
    group_winners(id){
        const list = this.rank_group(id);
        const number_of_entries = this.tournament.bracket.length+1;
        const number_of_groups = this.tournament.groups.length;
        let n = Math.floor(number_of_entries/number_of_groups);
        
        let min = Infinity;
        for(const item of this.tournament.groups){
            if(item.teams.length < min){min = item.teams.length;}
        }
        if(n > min){n = min;}

        let output = [];
        for(let i = 0; i < n; i++){
            if(list[i] == null){break;}
            output.push({team: list[i], group: id, pos: i});
        }
        return output;
    }

    // bestämmer de 'sista' platserna (bästa 3a osv..), 
    // när grupper/bracket inte har samma 'storlek'
    complete_bracket(group_winners_list){
        const size = (this.tournament.bracket.length+1);
        const missing = size - group_winners_list.length;
        if(missing == 0){return group_winners_list;}
    
        const del = group_winners_list.map((item) => {return item.team;});
        const rest = this.rank_all(del);
        
        let n = -1;
        for(let i = 0; i < missing; i++){
            if(rest[i] != null){
                group_winners_list = group_winners_list.concat({team: rest[i], group: -1, pos: n});
                n--;
            }else {
                group_winners_list = group_winners_list.concat(null);
            }
        }
        return group_winners_list;
    }

    // rankar en grupp efter poäng, högst till lägst
    rank_group(id){
        let teams = this.tournament.groups[id].teams.slice();
        let points = this.tournament.groups[id].points.slice();
        
        this.sort(teams, points);
        return teams;
    }

    // rankar alla spelare efter poäng, högst till lägst
    // remove: array med 'teams' som inte ska ingå
    rank_all(remove){
        let all_teams = [];
        let all_points = [];

        for(const item of this.tournament.groups){
            for(let i = 0; i < item.teams.length; i++){
                if(remove.includes(item.teams[i])){continue;}
                all_teams.push(item.teams[i]);
                all_points.push(item.points[i]);
            }
        }

        this.sort(all_teams, all_points);
        return all_teams;
    }

    // sorterar 'teams' efter 'points', har de samma poäng lottas ordningen
    // borde lägga till 'if' då grupperna är olika stora
    sort(teams, points){
        for(let i = 0; i < teams.length-1; i++){
            for(let j = i+1; j < teams.length; j++){
                if(points[j] > points[i]){
                    [points[i], points[j]] = [points[j], points[i]];
                    [teams[i], teams[j]] = [teams[j], teams[i]]; 
                }
                if(points[j] == points[i]){
                    if(Math.floor(Math.random()*2) == 0){
                        [points[i], points[j]] = [points[j], points[i]];
                        [teams[i], teams[j]] = [teams[j], teams[i]]; 
                    }
                }
            }
        }
    }

    // skapar en fullständig lista, om alla grupper är 'färdiga' 
    get_bracket(){
        let out = [];
        
        let k = 0;
        for(const item of this.tournament.groups){
            if(item.completed == false){
                console.log("alla grupper måste vara färdiga..");
                return false;
            }
            out = out.concat(this.group_winners(k));
            k++;
        }

        return this.complete_bracket(out);
    }

    // lägga till 'listan' till bracket, bor göras på annat sätt asså..
    populate_bracket(list){
        let r;
        const r4 = [0, 1, 4, 5];
        const r8 = [0, 1, 2, 3, 10, 11, 12, 13];
        const r16 = [0, 1, 2, 3, 4, 5, 6, 7, 22, 23, 24, 25, 26, 27, 28, 29];
    
        const n = this.tournament.bracket.length+1;
        if(n == 4){r = r4;} else
        if(n == 8){r = r8;} else
        if(n == 16){r = r16;}

        let x = 0;
        let y = 0;
        for(let i = 0; i < this.tournament.bracket.length; i++){
            if(r.includes(x)){
                for(let j = 0; j < 2; j++){
                    if(list[y] == null){
                        this.tournament.bracket[i].teams[j] = false;
                        this.tournament.bracket[i].placeholder[j] = 'n/a';
                    }else {
                        this.tournament.bracket[i].teams[j] = list[y].team;
                        this.tournament.bracket[i].placeholder[j] = null;
                    }
                    y++;
                }
            }
            x += 2;
        }

        return this.tournament.bracket;
    }
    
    // lägger till resultat för en match + skapar nästa match
    // OBS: kollar inte om 'teams' false, fixa det!
    bracket(id, r1, r2){
        const min = 0;
        const max = 99;
        if(r1 == r2 || r1 < min || r2 < min || r1 > max || r2 > max){return false;}    
        if(this.tournament.bracket[id] == null || this.tournament.bracket[id].status == true){return false;}
        if(this.tournament.bracket[id].teams[0] == null || this.tournament.bracket[id].teams[1] == null){return false;}

        let r;
        const r4 = [[1, 0], [null, null], [1, 1]];
        const r8 = [[2, 0], [2, 1], [3, 0], [null, null], [3, 1], [4, 0], [4, 1]];
        const r16 = [[4, 0], [4, 1], [5, 0], [5, 1], [6, 0], [6, 1], [7, 0], [null, null], [7, 1], [8, 0], [8, 1], [9, 0], [9, 1], [10, 0], [10, 1]];
        
        const n = this.tournament.bracket.length+1;
        if(n == 4){r = r4;} else
        if(n == 8){r = r8;} else
        if(n == 16){r = r16;}

        let output = {
            ['bracket.' + id + '.results.0']: r1,
            ['bracket.' + id + '.results.1']: r2,
            ['bracket.' + id + '.edit']: new Date().getTime(),
            ['bracket.' + id + '.status']: true
            //['bracket.' + id + '.status']: false
        };

        let index;
        if(r1 > r2){index = 0;}else {index = 1;}

        if(r[id][0] != null){
            output['bracket.' + r[id][0] + '.teams.' + r[id][1]] = this.tournament.bracket[id].teams[index];
            output['bracket.' + r[id][0] + '.placeholder.' + r[id][1]] =  null;
        }
        return output;
    }
}

module.exports = Progress;