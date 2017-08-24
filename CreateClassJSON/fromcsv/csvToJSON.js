#!/usr/bin/nodejs

var fs = require("fs");
fs.readFile("./new.csv", "utf8", function(err, results){
    var results = results.split("\n");
    var allJSON = {}
    //start from 1 to miss heaader
    for(var i=1; i<results.length;i++){
        results[i] = results[i].split(",")
        allJSON[results[i][1]] = {name: results[i][5], comment: results[i][9]}, comment: results[i][9]
    }
    console.log(JSON.stringify(allJSON))
})
function toArmy(time){
    var armyRe = /([0-9]+):([0-9]+)([ap]m)/;
    if(armyRe.test(time)==false){
        // throw "Invalid time: '"+time+"'";
        return;
    }
    var match = time.match(armyRe);
    if(match[3] == "pm"){
        if(match[1] == "12"){
            match[1] = 0;
        }
        
        
        return (parseInt(match[1])+12)+":"+match[2];
    }else{
        return match[1]+":"+match[2];
    }
}
