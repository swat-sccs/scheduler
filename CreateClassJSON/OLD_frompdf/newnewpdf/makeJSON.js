#!/usr/bin/nodejs

var fs = require("fs");
fs.readFile("./schedule.csv", "utf8", function(err, results){
    var prevRef = [];
    
    var spreadArr = results.split("\n");
    for(var d in spreadArr){
        spreadArr[d] = spreadArr[d].split("|");
    }
    //hasTimes, hasNoTimes, multipleTimes
    var outArr = [{},{}, {}];
    for(var i in spreadArr){
        console.log(spreadArr[i]);
        if(spreadArr[i][10] != null && spreadArr[i][11]!=null){
            //has time and dates
            var daysArr = timeStrToTime(spreadArr[i][10]);
            //      console.log(spreadArr[i][10].length)
            if(spreadArr[i][15]!=""){
                var otherTimeArr = JSON.parse(spreadArr[i][15].replace("+++", ""));
                console.log(otherTimeArr);
                console.log("other2"+otherTimeArr[1]);
                outArr[2][spreadArr[i][0]] = {id: spreadArr[i][0], start: toArmy(otherTimeArr[2].substring(0, otherTimeArr[2].indexOf(" - "))), end: toArmy(otherTimeArr[2].substring(otherTimeArr[2].indexOf(" - "))+3), dow: timeStrToTime(otherTimeArr[0]), type: otherTimeArr[0],days: otherTimeArr[1],time: otherTimeArr[2],rm: otherTimeArr[3]};
                //        spreadArr[i][9] = otherTimeArr[0]
                //        spreadArr[i][10] = otherTimeArr[1]
                //        spreadArr[i][11] = otherTimeArr[2]
                //        spreadArr[i][12] = otherTimeArr[3]
                //        outArr[1][]
            }
            
            
            var timeStr = spreadArr[i][11];
            console.log("timestr"+timeStr);
            if(prevRef.indexOf(spreadArr[i][0])!=-1){
                throw "Duplicate ref's: "+spreadArr[i][0];
            }
            var comment = "";
            if(spreadArr[i][14]!==""){
                comment = spreadArr[i][14].replace(/\|\|\s*/g, "");
            }
            //      var comment = ""
            //      if(spreadArr[i][14]!==""){
            //        comment = spreadArr[i][14].replace(/\|\|\s*/g, "")
            //      }
            
            //      outArr[0].push({comment: comment, id: spreadArr[i][0], start: toArmy(timeStr.substring(0, timeStr.indexOf(" - "))), end: toArmy(timeStr.substring(timeStr.indexOf(" - "))+3), dow: daysArr, ref: spreadArr[i][0], subj: spreadArr[i][1],num: spreadArr[i][2],sec: spreadArr[i][3], title: spreadArr[i][4],cred: spreadArr[i][5],dist: spreadArr[i][6],lim: spreadArr[i][7],instruct: spreadArr[i][8],type: spreadArr[i][9],days: spreadArr[i][10],time: spreadArr[i][11],rm: spreadArr[i][12]})
            outArr[0][spreadArr[i][0]] = {name: spreadArr[i][1]+" "+spreadArr[i][2], comment: comment, id: spreadArr[i][0], start: toArmy(timeStr.substring(0, timeStr.indexOf(" - "))), end: toArmy(timeStr.substring(timeStr.indexOf(" - "))+3), dow: daysArr, ref: spreadArr[i][0], subj: spreadArr[i][1],num: spreadArr[i][2],sec: spreadArr[i][3], title: spreadArr[i][4],cred: spreadArr[i][5],dist: spreadArr[i][6],lim: spreadArr[i][7],instruct: spreadArr[i][8],type: spreadArr[i][9],days: spreadArr[i][10],time: spreadArr[i][11],rm: spreadArr[i][12]};
            
            console.log(daysArr);
        }else{
            outArr[1][spreadArr[i][0]] = {id: spreadArr[i][0], ref: spreadArr[i][0], subj: spreadArr[i][1],num: spreadArr[i][2],sec: spreadArr[i][3], title: spreadArr[i][4],cred: spreadArr[i][5],dist: spreadArr[i][6],lim: spreadArr[i][7],instruct: spreadArr[i][8],type: spreadArr[i][9],days: spreadArr[i][10],time: spreadArr[i][11],rm: spreadArr[i][12]};
            //      outArr[1].push({ref: spreadArr[i][0], subj: spreadArr[i][1],num: spreadArr[i][2],sec: spreadArr[i][3], title: spreadArr[i][4],cred: spreadArr[i][5],dist: spreadArr[i][6],lim: spreadArr[i][7],instruct: spreadArr[i][8],type: spreadArr[i][9],days: spreadArr[i][10],time: spreadArr[i][11],rm: spreadArr[i][12]})
        }
    }
    console.log(outArr);
    return outArr;
    
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
        
        
        return (parseInt(match[1])+12)+":"+match[2];
    }else{
        return match[1]+":"+match[2];
    }
}


function timeStrToTime(timeStr){
    var weekConversion= {"M": 1,"T": 2,"W": 3,"R": 4,"F": 5,"S": 6,"U": 0};
    daysArr = [];
    if(timeStr == null){
        throw "there is an invalid weekly days:'"+timeStr+"'";
    }
    for(var z=0; z<timeStr.length;z++){
        //        console.log(spreadArr[i][10][z])
        if(!(timeStr[z] in weekConversion)){
            throw "there is an invalid weekly days:'"+timeStr+"'";
        }
        daysArr.push(weekConversion[timeStr[z]]);
    }
    return daysArr;
}
