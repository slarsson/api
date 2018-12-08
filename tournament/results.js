'use strict';

const Rank = require('./rank.js');

class Results {
    constructor(tournament, game_id){
        this.tournament = tournament;
        this.game_id = game_id;
        this.group = tournament.games[game_id].group;
    }

    add(r1, r2){
        const min = 0, max = 999;
        if(r1 < min || r2 < min || r1 > max || r2 > max){return false;}

        const pos1 = this.tournament.groups[this.group].teams.indexOf(this.tournament.games[this.game_id].teams[0]);
        const pos2 = this.tournament.groups[this.group].teams.indexOf(this.tournament.games[this.game_id].teams[1]);
 
        let p1_old = 0, p2_old = 0;
        let m1_old = 0, m2_old = 0;
        let gm1_old = 0, gm2_old = 0;
        let im1_old = 0, im2_old = 0;

        let o1_old = 0, o2_old = 0, v1_old = 0, v2_old = 0;
        if(this.tournament.games[this.game_id].results[0] != null && this.tournament.games[this.game_id].results[1] != null){
            ({p1: p1_old, p2: p2_old, o1: o1_old, o2: o2_old, v1: v1_old, v2: v2_old} = this.points(this.tournament.games[this.game_id].results[0], this.tournament.games[this.game_id].results[1]));
            m1_old = 1;
            m2_old = 1;
            gm1_old = this.tournament.games[this.game_id].results[0];
            gm2_old = this.tournament.games[this.game_id].results[1];
            im1_old = this.tournament.games[this.game_id].results[1];
            im2_old = this.tournament.games[this.game_id].results[0];
        }

        let {p1, p2, o1, o2, v1, v2} = this.points(r1, r2);
        p1 += (this.tournament.groups[this.group].points[pos1] - p1_old);
        p2 += (this.tournament.groups[this.group].points[pos2] - p2_old);

        let m1 = this.tournament.groups[this.group].stats[pos1][0] + 1 - m1_old;
        let m2 = this.tournament.groups[this.group].stats[pos2][0] + 1 - m2_old;

        v1 += (this.tournament.groups[this.group].stats[pos1][1] - v1_old);
        v2 += (this.tournament.groups[this.group].stats[pos2][1] - v2_old);

        o1 += (this.tournament.groups[this.group].stats[pos1][2] - o1_old);
        o2 += (this.tournament.groups[this.group].stats[pos2][2] - o2_old);

        let gm1 = this.tournament.groups[this.group].stats[pos1][3] + r1 - gm1_old;
        let gm2 = this.tournament.groups[this.group].stats[pos2][3] + r2 - gm2_old;

        let im1 = this.tournament.groups[this.group].stats[pos1][4] + r2 - im1_old;
        let im2 = this.tournament.groups[this.group].stats[pos2][4] + r1 - im2_old;

        // uppdatera resultat i objektet innan 'ranking'
        this.tournament.games[this.game_id].results[0] = r1;
        this.tournament.games[this.game_id].results[1] = r2;
        this.tournament.groups[this.group].points[pos1] = p1;
        this.tournament.groups[this.group].points[pos2] = p2;

        const r = new Rank(this.tournament);
        
        let new_rank = [];
        r.group(this.group).map((item) => {
            new_rank.push(this.tournament.groups[this.group].teams.indexOf(item));
        });

        return {
            ['games.' + this.game_id + '.results.0']: r1,
            ['games.' + this.game_id + '.results.1']: r2,
            ['games.' + this.game_id + '.status']: true,
            ['games.' + this.game_id + '.edit']: Date.now(),
            ['groups.' + this.group + '.points.' + pos1]: p1,
            ['groups.' + this.group + '.points.' + pos2]: p2,
            ['groups.' + this.group + '.stats.' + pos1 + '.0']: m1,
            ['groups.' + this.group + '.stats.' + pos2 + '.0']: m2,
            ['groups.' + this.group + '.stats.' + pos1 + '.1']: v1,
            ['groups.' + this.group + '.stats.' + pos2 + '.1']: v2,
            ['groups.' + this.group + '.stats.' + pos1 + '.2']: o1,
            ['groups.' + this.group + '.stats.' + pos2 + '.2']: o2,
            ['groups.' + this.group + '.stats.' + pos1 + '.3']: gm1,
            ['groups.' + this.group + '.stats.' + pos2 + '.3']: gm2,
            ['groups.' + this.group + '.stats.' + pos1 + '.4']: im1,
            ['groups.' + this.group + '.stats.' + pos2 + '.4']: im2,
            ['groups.' + this.group + '.stats.' + pos1 + '.5']: (gm1 - im1),
            ['groups.' + this.group + '.stats.' + pos2 + '.5']: (gm2 - im2),
            ['groups.' + this.group + '.rank']: new_rank
        };
    }

    status(){
        if(this.tournament.groups[this.group].completed == true){
            return false;
        }
        return true;
    }

    points(r1, r2){
        let p1, p2, o1 = 0, o2 = 0, v1 = 0, v2 = 0;
        if(r1 == r2){
            p1 = p2 = o1 = o2 = 1;
        } else if(r1 > r2){
            p1 = 3; p2 = 0;
            v1 = 1;
        } else if(r1 < r2){
            p1 = 0; p2 = 3;
            v2 = 1;
        };
        return {p1: p1, p2: p2, o1: o1, o2: o2, v1: v1, v2: v2};
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