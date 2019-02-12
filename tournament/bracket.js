'use strict';

class Bracket {
    static create(n_groups, n_teams, type = 2){
        let _size = 16;
        if(type == 0){
            _size = 4;
        }else if (type == 1){
            _size = 8;
        }

        // test:
        if(n_teams < 16){_size = 8;}
        if(n_teams < 8){_size = 4;}
        
        let x = this.get_groups_size(n_teams, n_groups);
        let y = this.get_qualify_size(n_groups, x.n_per_group, _size);

        // // ääääh.. vafan asså... 
        // if(n_teams < 8 && (_size == 8 || _size == 16)){return false;}
        // if(n_teams < 16 && _size == 16){return false;}

        let z = this.generate_bracket(n_groups, y.n_qualify_group, _size);
        
        if(n_teams < 4 && _size == 4){
            if(n_teams == 3){
                z[1][0] = -1;
            }

            if(n_teams == 2){
                z[1][0] = -1;
                z[3][0] = -1;
            }
        }

        if(_size == 16){return z;}
        return this.padding(z, _size, 16);
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

    static count(list, n){
        let tot = 0;
        for(let i = 0; i < list.length; i++){
            if(list[i][0] == n){tot++;}
        }
        return tot;
    }

    // fungerar ej när spelare saknas, blir så många specialfall..
    // därför kan endast turneringar som har nog antal lag för att
    // fylla upp slutspelsträdet skapas
    // begränsad av rad: 16 och 17
    static generate_bracket(n_groups, n_qualify_group, n_pos){
        let x = {left: [], right: []};
        let y = {left: [], right: []};

        // fördelar gruppvinnare mellan left/right
        let target = x.left;
        let _next = x.right;
        
        // specialfall för 1st grupp, sämsta ska möta bästa
        if(n_groups == 1){
            for(let i = 0; i < n_pos; i += 2){
                target.push(i);
                target.push(n_pos - 1 - i);
                [target, _next] = [_next, target];
            }
        }else {
            for(let i = 0; i < n_groups; i++){
                for(let j = 0; j < n_qualify_group; j++){
                    target.push(j);
                    [target, _next] = [_next, target];
                }
                
                if(i % 2 == 0){
                    [target, _next] = [_next, target]; 
                }
            }
        }

        for(let i = x.left.length; i < (n_pos / 2); i++){x.left.push(100);}
        for(let i = x.right.length; i < (n_pos / 2); i++){x.right.push(100);}

        x.left.sort((a, b) => {return a > b;});
        x.right.sort((a, b) => {return a > b;});

        for(let i = 0, j = ((n_pos / 2) - 1); i < (n_pos / 4); i++, j--){
            y.left.push([x.left[i], -1]);
            y.left.push([x.left[j], -1]);
            y.right.push([x.right[i], -1]);
            y.right.push([x.right[j], -1]);
        }

        // flytta positioner, blir bättre så :)
        if(y.left.length > 4){
            [y.left[2], y.left[6]] = [y.left[6], y.left[2]];
            [y.left[3], y.left[7]] = [y.left[7], y.left[3]];
            [y.right[2], y.right[6]] = [y.right[6], y.right[2]];
            [y.right[3], y.right[7]] = [y.right[7], y.right[3]];
        }
   
        // lägger till gruppnummer till matcherna
        target = y.left;
        _next = y.right;
        for(let j = 0; j < n_qualify_group; j++){
            let n = this.count(target, j);

            for(let k = 0; k < n; k++){
                for(let w = 0; w < target.length; w++){
                    if(target[w][0] == j && target[w][1] == -1){
                        target[w][1] = k;
                        break;
                    }
                }
            }
            
            for(let k = n; k < n_groups; k++){
                for(let w = 0; w < target.length; w++){
                    if(_next[w][0] == j && _next[w][1] == -1){
                        _next[w][1] = k;
                        break;
                    }
                }
            }
            
            [target, _next] = [_next, target];
        }

        target = y.left;
        _next = y.right;
        for(let step = 0; step < 2; step++){

            // flytta grupper som har samma grupp i fösta matchen
            // dvs undvika samma grupp i åttondelsfinalen
            for(let i = 0; i < target.length; i+=2){
                if(target[i][1] == target[i + 1][1]){
                    for(let j = i; j < target.length; j++){
                        if((target[i][0] == target[j][0]) && (target[i][1] != target[j][1])){
                            console.log("?????");
                            [target[i], target[j]] = [target[j], target[i]];
                        }
                    }
                }
            }

            // flytta på index 2,3 om det är möjligt,
            // dvs undvika att samma grupp möter varandra i kvartsfinalen
            if(target.length > 4){
                for(let i = target.length/2; i < target.length; i++){
                    if(target[2][0] == target[i][0]){
                        if(
                            target[0][1] != target[i][1]
                            &&
                            target[1][1] != target[i][1]
                            &&
                            target[2][1] != target[i][1]
                        ){
                            [target[i], target[2]] = [target[2], target[i]];
                        }
                    }
                }
    
    
                for(let i = target.length/2 +1; i < target.length; i++){
                    if(target[3][0] == target[i][0]){
                        if(
                            target[0][1] != target[i][1]
                            &&
                            target[1][1] != target[i][1]
                            &&
                            target[2][1] != target[i][1]
                            &&
                            target[3][1] != target[i][1]
                        ){
                            [target[i], target[3]] = [target[3], target[i]];
                        }
    
                    }
                }
            }

            [target, _next] = [_next, target];
        }

        return y.left.concat(y.right);
    }

    // // test my test
    // // fungerar mest troligt inte.....
    // static remove(list, n_items, n_groups){
    //     for(let i = 0; i < n_items; i++){
    //         let max = -1;
    //         let index;
    //         for(let j = 0; j < list.length; j++){
    //             if(list[j][0] > max){
    //                 max = list[j][0];
    //                 index = list[j];
    //             }
    //         }

    //         index[0] = -1;
    //         index[1] = -1;
    //     }

    //     return list;
    // }

    static padding(list, _size, _real_size){
        let newlist = new Array(_real_size).fill([-1, -1]);

        if(_size == 4){
            if(_real_size == 8){
                newlist[0] = list[0];
                newlist[2] = list[1];
                newlist[4] = list[2];
                newlist[6] = list[3];
            }else if(_real_size == 16){
                newlist[0] = list[0];
                newlist[4] = list[1];
                newlist[8] = list[2];
                newlist[12] = list[3];
            }
        }

        if(_size == 8){
            newlist[0] = list[0];
            newlist[2] = list[1];
            newlist[4] = list[2];
            newlist[6] = list[3];
            newlist[8] = list[4];
            newlist[10] = list[5];
            newlist[12] = list[6];
            newlist[14] = list[7];
        }
        
        return newlist;
    }

}

module.exports = Bracket;



// let test = Bracket.create(1, 2, 1);
// console.log(test);