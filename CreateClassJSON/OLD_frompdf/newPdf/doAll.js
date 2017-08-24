var fs = require("fs"),
    async = require("async");

var dirPath = "allCols/"; //provice here your path to dir
var filesPath = [];
for(var i = 1; i<=13;i++){
    filesPath.push(dirPath+i+".txt");
}
async.map(filesPath, function(filePath, cb){ //reading files or dir
    fs.readFile(filePath, "utf8", cb);
}, function(err, results) {
    for(var w in results){
        results[w] = results[w].split("\n");
        /* console.log(i) */
        /*         console.log(JSON.stringify(results[i])) */
    }
    //add one blank, extra msg
    results.push([], []);
    // var q = 0;
    // while(results[8][1].replace(/\s/g, "")!=""){
    //     results[8][0]+=results[8][1];
    //     results[8].splice(1,1);
    //     q++;
    //     if(i>=2){
    //         /* results[8].splice(1,0,"") */
    //     }
    // }
    //assumptions:
    //every course separated by 2 lines
    var needsNew = [];
    var firstPage = true;
    for(var i = 0; i<results[0].length;i++){
        var numHasNew = 0;
        var hasNew = [];
        for(var t in results){
            if(results[t][i] != null && results[t][i].indexOf("**NEWPAGE**")==0){
                numHasNew++;
                hasNew[t] = true;
            }else{
                hasNew[t] = false;
            }
        }
        console.log(numHasNew);
        if(numHasNew<12){
            for(var r in hasNew){
                if(hasNew[r]){
                    results[r].splice(i, 0, "$");
                }
            }
        }
        console.log(results[0].length-i);
        if((results[0].length-i)<=4){
            break;
        }
        // if(i==0 || (results[9][i] && results[9][i].indexOf("**NEWPAGE**")==0)){
        //     firstPage = true;
        //     // for(var o in results){
        //     //     if(results[o][i]){
        //     //         results[o][i] = results[o][i].replace("**NEWPAGE**", "");
        //     //     }
        //     // }
        //     results[9][i] = results[9][i].replace("**NEWPAGE**", "");
        //     if(firstPage && results[8][i] && results[8][i].replace(/s/g, "").toLowerCase() == "unknown"){
        //         results[8].splice(i,1);
        //     }else{
        //         var fullName = "";
        //         for(var y = 0; y<3;y++){
        //             if(results[8][i+y] && results[8][i+y].replace(/s/g, "")!=""){
        //                 fullName+=results[8][i+y];
        //                 // results[8][i+y] = ""
        //                 // if()
        //                 // if(y>0){
        //                     // console.log("erase")
        //                     // results[8].splice(i, 1);
        //                 // }
        //             }
        //         }
        //         // results[8].splice(i, 1);
        //         // results[8].splice(i, 1);
        //         fullName = fullName.replace("Unknow", "").replace(/,\s*n\s*/, ", ").replace(/^\s*/, "");
        //         results[8][i] = fullName;
        //         // console.log(fullName);
        //     }
        // }else{
        //     firstPage = false;
        // }
        var longMsg = "";
        for(var e = 1; e<=7;e++){
            if(i<results[0].length-1 && needsNew[e] == true && results[0][i+1].replace(/\s/g, "") != ""){
                results[e].splice(i, 0, "");
                needsNew[e] = false;
                continue;
            }
            if(i<results[e].length && results[0][i].replace(/\s/g, "") == ""){
                if(results[e][i].replace(/\s/g, "")!=""){
                    if(i<results[0].length-1 && results[0][i+1].replace(/\s/g, "")== "" && results[e][i+1].replace(/s/g, "")!=""){
                        needsNew[e] = true;
                    }
                    //TODO if repeated letter, don't add both
                    results[e][i] += "%";
                    longMsg+=results[e][i];
                    results[e][i] = "";
                }
            }
            if(longMsg!=""){
                results[14][i] = longMsg;
            }
            // if(i!=results[0].length && results[0][i].replace(/\s/g, "")=="" && results[0][i+1]){
            // if(i!=results[0].length && results[0][i].replace(/\s/g,"")!=""&&results[0][i+1].replace(/\s/g,"")=="" && results[1][i+1]!==""){
            //     needsNew = true;
            //     results[e].splice(i+1, 0, "!");
            // }
        }
        // console.log(needsNew.join("|"));
        // }
        // for(var p = 0; p<results[0].length;p++){
        var str = [];
        for(var z = 0; z<=14;z++){
            if(results[z][i] == null){
                results[z][i] = "@";
                // console.log("NOTHING FOR "+z);
                continue;
            }
            if(results[z][i].replace(/\s/g, "") == ""){
                results[z][i] = ".";
            }
            str[z] = results[z][i].replace(/^\s*/, "");
            // str+=results[z][p]+"|";
        }
        // if(firstPage){
        // if(str.join("|").replace(/[\.\|]/g, "") !=""){
        console.log(str.join("|"));
        // }
        // }
    }
    /* console.log(results); //this is state when all files are completely read */
    
});

