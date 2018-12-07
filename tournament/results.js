'use strict';

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
        if(this.tournament.games[this.game_id].results[0] != null && this.tournament.games[this.game_id].results[1] != null){
            ({p1: p1_old, p2: p2_old} = this.points(this.tournament.games[this.game_id].results[0], this.tournament.games[this.game_id].results[1]));
            
            m1_old = 1;
            m2_old = 1;

            gm1_old = this.tournament.games[this.game_id].results[0];
            gm2_old = this.tournament.games[this.game_id].results[1];

            im1_old = this.tournament.games[this.game_id].results[1];
            im2_old = this.tournament.games[this.game_id].results[0];

            // ta bort gammla poäng..
        }

        let {p1, p2} = this.points(r1, r2);
        p1 += (this.tournament.groups[this.group].points[pos1] - p1_old);
        p2 += (this.tournament.groups[this.group].points[pos2] - p2_old);

        // fixa stats
        // groups.stats[index][x]
        // 0 = antal spelade matcher
        // 1 = vunna
        // 2 = oavgjorda
        // 3 = antal mål
        // 4 = insläppta mål
        // 5 = mål skillnad

        // spelade
        let m1 = this.tournament.groups[this.group].stats[pos1][0] + 1 - m1_old;
        let m2 = this.tournament.groups[this.group].stats[pos2][0] + 1 - m2_old;

        // antal mål
        let gm1 = this.tournament.groups[this.group].stats[pos1][3] + r1 - gm1_old;
        let gm2 = this.tournament.groups[this.group].stats[pos2][3] + r2 - gm2_old;

        // insläppta
        let im1 = this.tournament.groups[this.group].stats[pos1][4] + r2 - im1_old;
        let im2 = this.tournament.groups[this.group].stats[pos2][4] + r1 - im2_old;


        return {
            ['games.' + this.game_id + '.results.0']: r1,
            ['games.' + this.game_id + '.results.1']: r2,
            ['groups.' + this.group + '.points.' + pos1]: p1,
            ['groups.' + this.group + '.points.' + pos2]: p2,
            ['games.' + this.game_id + '.status']: true,
            ['games.' + this.game_id + '.edit']: new Date().getTime(),

            ['groups.' + this.group + '.stats.' + pos1 + '.0']: m1,
            ['groups.' + this.group + '.stats.' + pos2 + '.0']: m2,

            ['groups.' + this.group + '.stats.' + pos1 + '.3']: gm1,
            ['groups.' + this.group + '.stats.' + pos2 + '.3']: gm2,

            ['groups.' + this.group + '.stats.' + pos1 + '.4']: im1,
            ['groups.' + this.group + '.stats.' + pos2 + '.4']: im2,

            ['groups.' + this.group + '.stats.' + pos1 + '.5']: (gm1 - im1),
            ['groups.' + this.group + '.stats.' + pos2 + '.5']: (gm2 - im2)
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