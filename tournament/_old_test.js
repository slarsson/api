'use strict';

class Bracket {
    static create(n_groups, n_teams, type = 2){
        let groups = n_groups;
        let players = n_teams;
        
        let _size = 16;
        if(type == 0){
            _size = 4;
        }else if (type == 1){
            _size = 8;
        }
    
        // let groups = 3;
        // let players = 80;
        // let _size = 16;

        let x = this.get_groups_size(players, groups);
        let y = this.get_qualify_size(groups, x.n_per_group, _size);
        let z = this.generate_games(players, groups, y.n_qualify_group, y.n_qualify_rest, _size);

        return this.side_my_side(z, groups, y.n_qualify_group);
    }
    
    static get_groups_size(n_teams, n_groups){
        return {
            n_per_group: Math.floor(n_teams / n_groups),
            n_rest: n_teams % n_groups
        };
    }
    
    static get_qualify_size(n_groups, n_per_group, n_bracket_pos){
        let n_qualify_group = Math.floor(n_bracket_pos / n_groups);
        if(n_per_group < n_qualify_group){n_qualify_group = n_per_group;} 
        
        return {
            n_qualify_group: n_qualify_group,
            n_qualify_rest: (n_bracket_pos - (n_groups * n_qualify_group))
        };
    }
    
    static best_to_worst(arr){
        for(let i = 0; i < (arr.length - 1); i++){
            for(let j = i + 1; j < arr.length; j++){
                if(arr[i][0] > arr[j][0]){
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
            }
        }
    }

    static generate_games(n_teams, n_groups, n_qualify_group, n_qualify_rest, n_pos){
        let list = [];
    
        for(let i = 0; i < n_groups; i++){
            for(let j = 0; j < n_qualify_group; j++){list.push([j, i ]);    }
        }
    
        if(n_teams < n_pos){n_qualify_rest -= (n_pos - n_teams);}
        for(let i = 0; i < n_qualify_rest; i++){list.push([100, -1]);}
    
        if(n_teams < n_pos){
            for(let i = 0; i < (n_pos - n_teams); i++){list.push([200, -2]);}
        }
    
        this.best_to_worst(list);

        let games = [];    
        for(let i = 0, j = (n_pos - 1); i < (n_pos / 2); i++, j--){
            if(list[i][1] == list[j][1]){
                for(let k = i; k < j; k++){
                    if(list[j][1] != list[k][1] && list[j][0] == list[k][0]){
                        [list[j], list[k]] = [list[k], list[j]];
                        break;
                    }
                }
            }
            
            games.push([list[i], list[j]]);
        }

        return games;
    };

    static to_vector(item, n_groups, n_qualify_group){
        let arr = new Array(n_groups + n_qualify_group + 2).fill(0);
    
        if(item[0][1] > -1){
            arr[item[0][1]] += 2;
        }
    
        if(item[1][1] > -1){
            arr[item[1][1]] += 2;
        }
            
        if(item[0][0] < 100){
            arr[item[0][0] + n_groups]++;
        }else {
            if(item[0][0] == 200){
                arr[arr.length - 1] += 2;
            }
    
            if(item[0][0] == 100){
                arr[arr.length - 2]++;
            }
        }
            
        if(item[1][0] < 100){
            arr[item[1][0] + n_groups]++;
        }else {
            if(item[1][0] == 200){
                arr[arr.length - 1] += 2;
            }
    
            if(item[1][0] == 100){
                arr[arr.length - 2]++;
            }
        }

        return arr;
    }

    static distance(arr1, arr2){
        let tot = 0;
        for(let i = 0; i < arr1.length; i++){
            tot += (arr1[i] - arr2[i]) * (arr1[i] - arr2[i]);
        }

        return Math.sqrt(tot);
    }

    static sum(v1, v2){
        let v3 = new Array(v1.length);
        for(let i = 0; i < v1.length; i++){
            v3[i] = v1[i] + v2[i];
        }
        return v3;
    }

    static side_my_side(data, n_groups, n_qualify_group){
        let left = [];
        let right = [];
    
        let target = left;
        let _next = right;
    
        let test = [];
    
        for(let i = 0; i < data.length; i++){
            let x = this.to_vector(data[i], n_groups, n_qualify_group);
            test.push(x);
            data[i].push(x);
        }
    

        let mygroups = [];
    
        for(let k = 0; k < data.length; k += 2){
            let max = -1;
            let selected;
            
            for(let i = (k + 1); i < data.length; i++){
                let x = this.distance(test[k], test[i]);
                if(x >= max){
                    selected = i;
                    max = x;
                }
            }

            mygroups.push([data[selected], data[k]]);
            [data[selected], data[k + 1]] = [data[k+1], data[selected]];
        }
    
        if(mygroups.length > 3){
            let lnf = [];
    
            //console.log(mygroups);
    
            for(let k = 0; k < mygroups.length; k += 2){
                let max = -1;
                let selected;
                
                for(let i = (k + 1); i < mygroups.length; i++){
                    let x = this.distance(
                        this.sum(mygroups[k][0][2], mygroups[k][1][2]), 
                        this.sum(mygroups[i][0][2], mygroups[i][1][2])
                    );

                    if(x >= max){
                        selected = i;
                        max = x;
                    }
                }

                lnf.push([mygroups[selected], mygroups[k]]);
                [mygroups[selected], mygroups[k + 1]] = [mygroups[k + 1], mygroups[selected]];
            }
            
            console.log(lnf);
            return lnf;
    
        }else {
            return mygroups;
        }
    }

}



//let test = Bracket.create(2, 50, 2);

// console.log("left:");
// console.log(test[0][0]);
// console.log(test[0][1]);

// console.log("right:");
// console.log(test[1][0]);
// console.log(test[1][1]);

module.exports = Bracket;