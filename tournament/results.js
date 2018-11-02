'use strict';

class Results {
    constructor(tournament, game_id){
        this.tournament = tournament;
        this.game_id = game_id;
        this.group = tournament.games[game_id].group;
    }

    add(r1, r2){
        const min = 0;
        const max = 99;
        if(r1 < min || r2 < min || r1 > max || r2 > max){return false;}

        const pos1 = this.tournament.groups[this.group].teams.indexOf(this.tournament.games[this.game_id].teams[0]);
        const pos2 = this.tournament.groups[this.group].teams.indexOf(this.tournament.games[this.game_id].teams[1]);
 
        let p1_old = 0;
        let p2_old = 0;
        if(this.tournament.games[this.game_id].results[0] != null && this.tournament.games[this.game_id].results[1] != null){
            ({p1: p1_old, p2: p2_old} = this.points(this.tournament.games[this.game_id].results[0], this.tournament.games[this.game_id].results[1]));
        }

        let {p1, p2} = this.points(r1, r2);
        p1 += (this.tournament.groups[this.group].points[pos1] - p1_old);
        p2 += (this.tournament.groups[this.group].points[pos2] - p2_old);

        return {
            ['games.' + this.game_id + '.results.0']: r1,
            ['games.' + this.game_id + '.results.1']: r2,
            ['groups.' + this.group + '.points.' + pos1]: p1,
            ['groups.' + this.group + '.points.' + pos2]: p2,
            ['games.' + this.game_id + '.status']: true,
            ['games.' + this.game_id + '.edit']: new Date().getTime()
        };
    }

    status(){
        if(this.tournament.groups[this.group].completed == true){
            return false;
        }
        return true;
    }

    points(r1, r2){
        let p1, p2;
        if(r1 == r2){p1 = 1; p2 = 1;} else 
        if(r1 > r2){p1 = 3; p2 = 0;} else 
        if(r1 < r2){p1 = 0; p2 = 3;};
        return {p1: p1, p2: p2};
    }

    group_completed(){
        const group = this.tournament.games[this.game_id].group;
        let i = 0;
        for(const item of this.tournament.games){
            if(item.status == false && item.group == group && i != this.game_id){
                return false;
            }
            i++;
        }
        return true;
    }
}

module.exports = Results;