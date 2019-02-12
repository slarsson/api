'use strict';

// 1. poäng
// 2. antal vinster
// 3. målskillnad
// 4. lottning
// 'all' tar hänsyn till att det kan vara olika antal i grupperna

class Rank {
    constructor(tournament){
        this.groups = tournament.groups;
        this.games = tournament.games;

        /*
        this.test = [
            {teams: [1, 2, 3, 4, 5], points: [2, 0, 4, 4, 6], completed: false},
            {teams: [0, 6, 7, 8, 9], points: [0, 0, 2, 44, 4], completed: false},
            {teams: [10, 11, 12, 13, 14], points: [2, 0, 3, 3, 6], completed: false}
        ];
        */
    }
    
    group(id){
        if(this.groups[id] == null){return false;}
        return this.sort(this.groups[id].teams, this.groups[id].points, true);
    }

    all(excludes){ 
        let teams = [];
        let points = [];

        for(const item of this.groups){
            //console.log(item);
            for(let i = 0; i < item.teams.length; i++){
                if(excludes.includes(item.teams[i])){continue;}
                teams.push(item.teams[i]);
                points.push(item.points[i] / item.teams.length);
            }
        } 

        return this.sort(teams, points, false);
    }

    sort(teams, points, group){
        teams = teams.slice();
        points = points.slice();

        for(let i = 0; i < teams.length-1; i++){
            for(let j = i+1; j < teams.length; j++){
                if(points[j] > points[i]){
                    [points[i], points[j]] = [points[j], points[i]];
                    [teams[i], teams[j]] = [teams[j], teams[i]];
                    continue;
                }
                
                if(points[j] == points[i]){
                    let t1, t2;
                    if(group){
                        ({r1: t1, r2: t2} = this.wins(teams[j], teams[i]));
                    }else {
                        t1 = this.sum(teams[j]);
                        t2 = this.sum(teams[i]);
                    }

                    if(t1[0] > t2[0]){
                        [points[i], points[j]] = [points[j], points[i]];
                        [teams[i], teams[j]] = [teams[j], teams[i]];
                        continue;
                    }

                    if(t1[1] > t1[1]){
                        [points[i], points[j]] = [points[j], points[i]];
                        [teams[i], teams[j]] = [teams[j], teams[i]];
                        continue;
                    }

                    if(Math.floor(Math.random()*2) == 0){
                        [points[i], points[j]] = [points[j], points[i]];
                        [teams[i], teams[j]] = [teams[j], teams[i]];
                    }
                }
            }
        }

        return teams;
    }

    wins(t1, t2){
        let res_t1 = [0, 0]; //wins, goals, 
        let res_t2 = [0, 0];

        for(const item of this.games){
            if(item.status){
                if((item.teams[0] == t1 || item.teams[0] == t2) && (item.teams[1] == t1 || item.teams[1] == t2)){
                    if(item.results[0] > item.results[1]){
                        if(item.teams[0] == t1){
                            res_t1[0]++;
                        }else {
                            res_t2[0]++;
                        }
                    }else if(item.results[1] > item.results[0]){
                        if(item.teams[1] == t1){
                            res_t1[0]++;
                        }else {
                            res_t2[0]++;
                        }
                    }

                    res_t1[1] += item.results[0];
                    res_t2[1] += item.results[1];
                }
            }
        }

        return {r1: res_t1, r2: res_t2};
    }

    sum(team){
        let res = [0, 0, 0]; // wins, goals, -goals
        for(const item of this.games){
            if(item.status){
                if(item.teams[0] == team){
                    if(item.results[0] > item.results[1]){
                        res[0]++;
                    }

                    res[1] += item.results[0];
                    res[2] += item.results[1];
                }

                if(item.teams[1] == team){
                    if(item.results[1] > item.results[0]){
                        res[0]++;
                    }

                    res[1] += item.results[1];
                    res[2] += item.results[0];
                }
            }
        }

        const i = this.find_group(team);
        return [(res[0] / this.groups[i].teams.length), ((res[1] - res[2]) / this.groups[i].teams.length)];
    }

    find_group(team){
        for(let i = 0; i < this.groups.length; i++){
            if(this.groups[i].teams.includes(team)){
                return i;
            }
        }
        return 0;
    }
}

module.exports = Rank;