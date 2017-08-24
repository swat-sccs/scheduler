#!/usr/bin/nodejs

var fs = require("fs");
var re = /<word xMin="([0-9\.]+)" yMin="([0-9\.]+)" xMax="([0-9\.]+)" yMax="([0-9\.]+)">([^<]*)/;
fs.readFile("./all.txt", "utf8", function(err, results){
    results = results.split("\n");
    var pages = [];
    var prevY = [];
    for(var i = 0; i<results.length;i++){
        var parsedLine = results[i].match(re);
        if(parsedLine == null || parseFloat(parsedLine[2])<60|| parseFloat(parsedLine[2])>(513+33)||parsedLine[5] == "n"||parsedLine[5] == "Unknow"){
            // console.log(results[i]+" DOESNT MATCH");
            if(results[i].indexOf("page")!=-1){
                pages.push([]);
                prevY = [];
            }
            continue;
        }
        var x = parseFloat(parsedLine[1]);
        var y = parsedLine[2];
        // console.log(y)
        var lastPgIndex = pages.length-1;
        var yIndex = 0;
        if(prevY.indexOf(y) == -1){
            prevY.push(y);
            pages[lastPgIndex].push({y: y, crs:"",subj:"",num:"",sec:"",title:"",cred:"",dist:"",lim:"",instruc:"",type:"",days:"",times:"",bld:"", notes: "", extraTimes: ""});
        }
            //almost always should be in correct ascending order but just in case
        for(var e = pages[lastPgIndex].length-1; e>=0; e--){
            if(pages[lastPgIndex][e].y == y){
                yIndex = e;
                break;
            }
        }
        // console.log(yIndex)
        // console.log(parsedLine[0])
        if(x >=33 && x<=85){
            appendToCol(pages[lastPgIndex][yIndex].crs += parsedLine[5]+" ");
        }else if(x >=85 && x<=112){
            appendToCol(pages[lastPgIndex][yIndex].subj += parsedLine[5]+" ");
        }else if(x >=112 && x<=142){
            appendToCol(pages[lastPgIndex][yIndex].num += parsedLine[5]+" ");
        } else if(x >=142 && x<=172){
            appendToCol(pages[lastPgIndex][yIndex].sec += parsedLine[5]+" ");
        } else if(x >=172 && x<=293){
            appendToCol(pages[lastPgIndex][yIndex].title += parsedLine[5]+" ");
        } else if(x >=293 && x<=322){
            appendToCol(pages[lastPgIndex][yIndex].cred += parsedLine[5]+" ");
        } else if(x >=322 && x<=357){
            appendToCol(pages[lastPgIndex][yIndex].dist += parsedLine[5]+" ");
        } else if(x >=357 && x<=409){
            appendToCol(pages[lastPgIndex][yIndex].lim += parsedLine[5]+" ");
        } else if(x >=409 && x<=509){
            appendToCol(pages[lastPgIndex][yIndex].instruc += parsedLine[5]+" ");
        } else if(x >=509 && x<=579){
            appendToCol(pages[lastPgIndex][yIndex].type += parsedLine[5]+" ");
        } else if(x >=579 && x<=609){
            appendToCol(pages[lastPgIndex][yIndex].days += parsedLine[5]+" ");
        } else if(x >=609 && x<=689){
            appendToCol(pages[lastPgIndex][yIndex].times += parsedLine[5]+" ");
        } else if(x >=689 && x<=759){
            appendToCol(pages[lastPgIndex][yIndex].bld += parsedLine[5]+" ");
        }

        // pages[pages.length-1][y].push({"x": x, "str": parsedLine[5]});//[x] = parsedLine[5];
        // pages[pages.length-1][y].sort(function(a,b){
        //     return a.x-b.x;
        // });
        // if(parsedLine[2] == y){
        //     newPage[newPage.length-1][parsedLine[2]].push(parsedLine[2]+" "+parsedLine[5]);
        // }else{
        //     if(parsedLine[2]<y){
        //         //new page
        //         pages.push(newPage);
        //         newPage = [];
        //         newPage.push([parsedLine[2]+" "+parsedLine[5]]);
        //     }else{
        //         newPage.push([parsedLine[2]+" "+parsedLine[5]]);
        //     }
        // }
    }
    // console.log(Object.keys(pages[0]));
    var dictToArr = ["crs","subj","num","sec","title","cred","dist","lim","instruc","type","days","times","bld"];
    for(var q = 0; q<pages.length;q++){
        for(var z=pages[q].length-1; z>=0;z--){
            var deleteLine = false
            if(pages[q][z].crs == "" && pages[q][z].subj!=""){
                for(var r = 0; r<=7;r++){
                    //needed to keep correct order
                    pages[q][z-1].notes+=pages[q][z][dictToArr[r]];
                }
                //2 lines of notes
                if(pages[q][z].notes!=""){
                    pages[q][z-1].notes+=pages[q][z].notes+" ";
                }
                deleteLine = true;
            }
            if(pages[q][z].crs == "" && pages[q][z].instruc!=""){
                //doesn't go to instruc
                pages[q][z-1].instruc+=" & "+pages[q][z].instruc;
                deleteLine = true;
            }
            if(pages[q][z].crs == "" && pages[q][z].days!=""){
                //2 lines of notes
                pages[q][z-1].extraTimes = JSON.stringify([pages[q][z].days, pages[q][z].times,pages[q][z].bld]);
                //assume not more than one extra time
                deleteLine = true;
            }
            if(deleteLine){
                delete pages[q][z];
            }
        }
    }
    for(var q = 0; q<pages.length;q++){
        for(var z in pages[q]){
            // for(var u in pages[q][z]){
            //     if(pages[q][z][u] == ""){
            //         pages[q][z][u] = ".";
            //     }
            // }
            var outputStr = pages[q][z].crs+"|"+pages[q][z].subj+"|"+pages[q][z].num+"|"+pages[q][z].sec+"|"+pages[q][z].title+"|"+pages[q][z].cred+"|"+pages[q][z].dist+"|"+pages[q][z].lim+"|"+pages[q][z].instruc+"|"+pages[q][z].type+"|"+pages[q][z].days+"|"+pages[q][z].times+"|"+pages[q][z].bld+"|$|"+pages[q][z].notes+"|"+pages[q][z].extraTimes;
            outputStr = outputStr.replace(/\s*\|/g, "|");
            console.log(outputStr);
        }
    }
    // console.log(JSON.stringify(pages));
});

function appendToCol(old, append){
    if(old == ""){
        return append;
    }else{
        return old+" "+append;
    }
}
