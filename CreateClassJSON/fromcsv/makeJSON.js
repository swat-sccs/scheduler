#!/usr/bin/nodejs

var fs = require("fs");
fs.readFile("./schedule.csv", "utf8", function(err, results){
    var prevRef = [];
    if (results.indexOf("^")!=-1){
        throw "There is a caret '^' in the returned CSV so likely a delim ('|') error"
    }
    
    var spreadArr = results.split("\n");
    for(var d in spreadArr){
        //From FilterOptions 124 from doAll.sh
        spreadArr[d] = spreadArr[d].split("|");
    }
    //hasTimes, hasNoTimes, multipleTimes
    var outArr = [{},{}, {}];
    for(var i = 1; i<spreadArr.length;i++){
        if(spreadArr[i] == ""){
            continue
        }
        // console.log(spreadArr[i].join("|"));
        if(spreadArr[i][14] != "" && spreadArr[i][15]!=""){
            //has time and dates
            var daysArr = timeStrToTime(spreadArr[i][15]);
            //      console.log(spreadArr[i][10].length)
            if(spreadArr[i][17]!=""){
                //Has desc2, time2, ...*2
                var timeStr = spreadArr[i][18];
                /* outArr[2][spreadArr[i][1]] = {title:spreadArr[i][5]+" "+spreadArr[i][17],id: spreadArr[i][1], start: toArmy(timeStr.substring(0, timeStr.indexOf("-"))), end: toArmy(timeStr.substring(timeStr.indexOf("-"))+3), dow: timeStrToTime(spreadArr[i][19]), type: spreadArr[i][17],days: spreadArr[i][18],time: timeStr,rm: spreadArr[i][20]}; */
            outArr[2][spreadArr[i][1]] = {name: spreadArr[i][2]+" "+spreadArr[i][3], comment: spreadArr[i][9], id: spreadArr[i][1], start: toArmy(timeStr.substring(0, timeStr.indexOf("-"))), end: toArmy(timeStr.substring(timeStr.indexOf("-"))+3), dow: JSON.stringify(timeStrToTime(spreadArr[i][19])), title: spreadArr[i][5]+" "+spreadArr[i][17],time: timeStr,rm: spreadArr[i][16], type:spreadArr[i][17], days:spreadArr[i][18]};
            }
            
            
            var timeStr = spreadArr[i][14];
            /* console.log("timestr"+timeStr); */
            /* if(prevRef.indexOf(spreadArr[i][0])!=-1){ */
            /*     throw "Duplicate ref's: "+spreadArr[i][0]; */
            /* } */
            /* var comment = ""; */
            /* if(spreadArr[i][14]!==""){ */
            /*     comment = spreadArr[i][14].replace(/\|\|\s*g, ""); */
            /* } */
            //      var comment = ""
            //      if(spreadArr[i][14]!==""){
            //        comment = spreadArr[i][14].replace(/\|\|\s*/g, "")
            //      }
            
            //      outArr[0].push({comment: comment, id: spreadArr[i][0], start: toArmy(timeStr.substring(0, timeStr.indexOf("-"))), end: toArmy(timeStr.substring(timeStr.indexOf("-"))+3), dow: daysArr, ref: spreadArr[i][0], subj: spreadArr[i][1],num: spreadArr[i][2],sec: spreadArr[i][3], title: spreadArr[i][4],cred: spreadArr[i][5],dist: spreadArr[i][6],lim: spreadArr[i][7],instruct: spreadArr[i][8],type: spreadArr[i][9],days: spreadArr[i][10],time: spreadArr[i][11],rm: spreadArr[i][12]})
            outArr[0][spreadArr[i][1]] = {name: spreadArr[i][2]+" "+spreadArr[i][3], comment: spreadArr[i][9], id: spreadArr[i][1], start: toArmy(timeStr.substring(0, timeStr.indexOf("-"))), end: toArmy(timeStr.substring(timeStr.indexOf("-"))+3), dow: JSON.stringify(daysArr), ref: spreadArr[i][1], subj: spreadArr[i][2],num: spreadArr[i][3],sec: spreadArr[i][4], title: spreadArr[i][5],cred: spreadArr[i][6],dist: spreadArr[i][7],lim: spreadArr[i][8],instruct: (spreadArr[i][10]+", "+spreadArr[i][11]).replace(/, $/, ""),type: spreadArr[i][13],days: spreadArr[i][15],time: spreadArr[i][14],rm: spreadArr[i][16]};
            
            // console.log(daysArr);
        }else{
                //No time given
            /* outArr[1][spreadArr[i][0]] = {id: spreadArr[i][0], ref: spreadArr[i][0], subj: spreadArr[i][1],num: spreadArr[i][2],sec: spreadArr[i][3], title: spreadArr[i][4],cred: spreadArr[i][5],dist: spreadArr[i][6],lim: spreadArr[i][7],instruct: spreadArr[i][8],type: spreadArr[i][9],days: spreadArr[i][10],time: spreadArr[i][11],rm: spreadArr[i][12]}; */
            // console.log(JSON.stringify(spreadArr[i]))
            outArr[1][spreadArr[i][1]] = {name: spreadArr[i][2]+" "+spreadArr[i][3], comment: spreadArr[i][9], id: spreadArr[i][1],  ref: spreadArr[i][1], subj: spreadArr[i][2],num: spreadArr[i][3],sec: spreadArr[i][4], title: spreadArr[i][5],cred: spreadArr[i][6],dist: spreadArr[i][7],lim: spreadArr[i][8],instruct: (spreadArr[i][10]+", "+spreadArr[i][10]).replace(/, $/, ""),type: spreadArr[i][13],rm: spreadArr[i][16]};
            //      outArr[1].push({ref: spreadArr[i][0], subj: spreadArr[i][1],num: spreadArr[i][2],sec: spreadArr[i][3], title: spreadArr[i][4],cred: spreadArr[i][5],dist: spreadArr[i][6],lim: spreadArr[i][7],instruct: spreadArr[i][8],type: spreadArr[i][9],days: spreadArr[i][10],time: spreadArr[i][11],rm: spreadArr[i][12]})
        }
    }
        fs.writeFile("schedule.json", JSON.stringify(outArr), function(err){
                if(err){
                        console.log("Error writing file")
                }
        })
        fs.writeFile("schedule.js", "var classSchedObj = "+JSON.stringify(outArr), function(err){
                if(err){
                        console.log("Error writing file")
                }
        })
        console.log("wrote json to file")
});

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
        
        
        return twoDigits((parseInt(match[1])+12))+":"+twoDigits(match[2]);
    }else{
        return twoDigits(match[1])+":"+twoDigits(match[2]);
    }
}
function twoDigits(value) {
        if(value.length==2){
                return value
        }
      return (value < 10 ? '0' : '') + value;
}


function timeStrToTime(timeStr){
    // console.log(timeStr)
    timeStr = timeStr.replace("TH", "R")
    var weekConversion= {"M": 1,"T": 2,"W": 3,"R": 4,"F": 5,"S": 6,"U": 0};
    daysArr = [];
    if(timeStr == null){
        throw ("there is an invalid weekly days:'"+timeStr+"'");
    }
    for(var z=0; z<timeStr.length;z++){
        //        console.log(spreadArr[i][10][z])
        if(!(timeStr[z] in weekConversion)){
            throw ("there is an invalid for loop weekly days:'"+timeStr+"'");
        }
        daysArr.push(weekConversion[timeStr[z]]);
    }
    return daysArr;
}
