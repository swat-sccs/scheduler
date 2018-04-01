#!/usr/bin/nodejs

//Copy from 1st line of XLS
var COLS = "TERM	DEPT	CRN	SUBJ	CRSE#	SEC	TITLE	CR	DISTR	PROJ	COMMENT	INSTR1	INSTR2	PTRM	DESC1	TIME1	DAYS1	BLDG_RM1	DESC2	TIME2	DAYS2	BLDG_RM2".split(/\s+/)

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
	
	//check 1st line columns
	for(var i = 0; i<spreadArr[0].length;i++){
		if(spreadArr[0][i]!=COLS[i]){
			throw "IN COL "+(i+1)+", expected '"+COLS[i]+"', has '"+spreadArr[0][i];
		}
	}
    //hasTimes, hasNoTimes, multipleTimes
    var outArr = [{},{}, {}];
    for(var i = 1; i<spreadArr.length;i++){
        if(spreadArr[i] == ""){
            continue
        }
        //has time and dates
        if(spreadArr[i][COLS.indexOf("TIME1")] != "" || spreadArr[i][COLS.indexOf("TIME2")]!=""){
            var daysArr = timeStrToTime(spreadArr[i][COLS.indexOf("DAYS1")]);
            if(spreadArr[i][COLS.indexOf("DESC2")]!=""){
                //Has desc2, time2, ...*2
                var timeStr = spreadArr[i][COLS.indexOf("TIME2")];

				outArr[2][spreadArr[i][COLS.indexOf("CRN")]] = {
					name:    spreadArr[i][COLS.indexOf("SUBJ")]+" "+spreadArr[i][COLS.indexOf("CRSE#")],
					comment: spreadArr[i][COLS.indexOf("COMMENT")],
					id:      spreadArr[i][COLS.indexOf("CRN")],
					start:   toArmy(timeStr.substring(0, timeStr.indexOf("-"))),
					end:     toArmy(timeStr.substring(timeStr.indexOf("-"))+3),
					dow:     JSON.stringify(timeStrToTime(spreadArr[i][COLS.indexOf("DAYS2")])),
					title:   spreadArr[i][COLS.indexOf("TITLE")]+" "+spreadArr[i][COLS.indexOf("DESC2")],
					time:    timeStr,
					rm:      spreadArr[i][COLS.indexOf("BLDG_RM2")]+"(Main: "+spreadArr[i][COLS.indexOf("BLDG_RM1")]+")",
					type:    spreadArr[i][COLS.indexOf("DESC2")],
					days:    spreadArr[i][COLS.indexOf("DAYS2")],
					dpt:     spreadArr[i][COLS.indexOf("DEPT")],
				};
            }
            
			//TODO duplicates?
            /* console.log("timestr"+timeStr); */
            /* if(prevRef.indexOf(spreadArr[i][0])!=-1){ */
            /*     throw "Duplicate ref's: "+spreadArr[i][0]; */
            /* } */

			//Normal
            var timeStr = spreadArr[i][COLS.indexOf("TIME1")];

			outArr[0][spreadArr[i][COLS.indexOf("CRN")]] = {
				name:     spreadArr[i][COLS.indexOf("SUBJ")]+" "+spreadArr[i][COLS.indexOf("CRSE#")],
				comment:  spreadArr[i][COLS.indexOf("COMMENT")],
				id:       spreadArr[i][COLS.indexOf("CRN")],
				start:    toArmy(timeStr.substring(0, timeStr.indexOf("-"))),
				end:      toArmy(timeStr.substring(timeStr.indexOf("-"))+3),
				dow:      JSON.stringify(daysArr),
				ref:      spreadArr[i][COLS.indexOf("CRN")],
				subj:     spreadArr[i][COLS.indexOf("SUBJ")],
				num:      spreadArr[i][COLS.indexOf("CRSE#")],
				sec:      spreadArr[i][COLS.indexOf("SEC")],
				title:    spreadArr[i][COLS.indexOf("TITLE")],
				cred:     spreadArr[i][COLS.indexOf("CR")],
				dist:     spreadArr[i][COLS.indexOf("DISTR")],
				lim:      spreadArr[i][COLS.indexOf("PROJ")],
				instruct: (spreadArr[i][COLS.indexOf("INSTR1")]+", "+spreadArr[i][COLS.indexOf("INSTR2")]).replace(/, $/, ""),
				type:     spreadArr[i][COLS.indexOf("DESC1")],
				days:     spreadArr[i][COLS.indexOf("DAYS1")],
				time:     spreadArr[i][COLS.indexOf("TIME1")],
				rm:       spreadArr[i][COLS.indexOf("BLDG_RM1")],
                dpt:      spreadArr[i][COLS.indexOf("DEPT")],
			};
        }else{
                //No time given
			outArr[1][spreadArr[i][COLS.indexOf("CRN")]] = {
				name:     spreadArr[i][COLS.indexOf("SUBJ")]+" "+spreadArr[i][COLS.indexOf("CRSE#")]+" (NO TIME SLOT)",
				comment:  spreadArr[i][COLS.indexOf("COMMENT")],
				id:       spreadArr[i][COLS.indexOf("CRN")],
				ref:      spreadArr[i][COLS.indexOf("CRN")],
				subj:     spreadArr[i][COLS.indexOf("SUBJ")],
				num:      spreadArr[i][COLS.indexOf("CRSE#")],
				sec:      spreadArr[i][COLS.indexOf("SEC")],
				title:    spreadArr[i][COLS.indexOf("TITLE")],
				cred:     spreadArr[i][COLS.indexOf("CR")],
				dist:     spreadArr[i][COLS.indexOf("DISTR")],
				lim:      spreadArr[i][COLS.indexOf("PROJ")],
				instruct: (spreadArr[i][COLS.indexOf("INSTR1")]+", "+spreadArr[i][COLS.indexOf("INSTR2")]).replace(/, $/, ""),
				type:     spreadArr[i][COLS.indexOf("DESC1")],
				rm:       spreadArr[i][COLS.indexOf("BLDG_RM1")],
				time:     "No Time Given",
                dpt:      spreadArr[i][COLS.indexOf("DEPT")],
			};
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
        if(!(timeStr[z] in weekConversion)){
            throw ("there is an invalid for loop weekly days:'"+timeStr+"'");
        }
        daysArr.push(weekConversion[timeStr[z]]);
    }
    return daysArr;
}
