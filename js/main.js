var authorized = false;
//TODO REDO EVERY SEMESTER SO GOOGLE CALENDAR ONLY CLEARS OUT MOST RECENT
var term                = "spring17";
var classes             = {};
var highlightedClasses  = [];
var allAddedClassObj    = [{},{}];

var CLIENT_ID        = '590889346032-44j8s8s3368lagbb3f9drn3i4rgc73ld.apps.googleusercontent.com';
//CAN'T BE ARRAY OF FAILS SILENTLY (Change to new gapi client v2)
var SCOPES           = "https://www.googleapis.com/auth/calendar.readonly";

var authorized = false;


//Jan 17 start sem
//Fall 2017 start sem = Sep 4
//month and day number are 0 indexed! so -1
//Jan 22 2018 = Spring 2018 start
var startSemesterTime = Date.UTC(2018,0,22,0,0,0);
//Apr 28 start sem
//YEARMONTHDAY+"T000000Z", pad with 0s
//Dec 12
//May 4 for Spring 2018 end
var endSemesterISO   = "20170504T000000Z";
var globalFromButton = false;

var startSemDate = new Date(startSemesterTime);
var startSemDay  = startSemDate.getUTCDay();

/* TODO add holidays manually
var exceptionDays = "";
var i = -1;
for(var q = startSemDay-1; q>=1;q--){
    exceptionDays+=toDateStr(addDay(startSemDate,i))+",";
    i--;
}
exceptionDays = exceptionDays.substring(0,exceptionDays.length-1);
 */

var quotes = ["The cure for boredom is curiosity. There is no cure for curiosity. \n -Ellen Parr", "It always seems impossible until it is done\n - Nelson Mandela", "Education is what survives when what has been learned has been forgotten.\n - BF Skinner", "Everybody is a genius ... But, if you judge a fish by its ability to climb a tree, it will live its whole life believing it is stupid\n - Albert Einstein", "No pressure, no diamonds\n - Thomas Carlyle", "One kind word can change someone's entire day", "When nothing goes right ...  go left"];

$( document ).ready(function() {
    //classSchedObj from included schedule.js file (made with `doAll` in folder)
    //classSchedObj = [hasTimes, hasNoTimes, multipleTimes]
    tableArr = [];


    //Do normal hasTimes and hasNoTimes. multipleTimes is checked when added to see if exists
    for(var i=0; i<=1; i++){
        for(var z in classSchedObj[i]){
            var id = classSchedObj[i][z].id;
            //classSchedObj[i][z].idCopy = id;
            //TODO what should the ADA label be?
            classSchedObj[i][z].labelSummary = classSchedObj[i][z].ref+" "+classSchedObj[i][z].name;
            if(id in classSchedObj[2]){
                /* console.log(id)*/
                classSchedObj[i][z].type += "<br>"+classSchedObj[2][id].type;
                classSchedObj[i][z].days += "<br>"+classSchedObj[2][id].days;
                classSchedObj[i][z].time += "<br>"+classSchedObj[2][id].time;
                classSchedObj[i][z].rm   += "<br>"+classSchedObj[2][id].rm;
            }
            tableArr.push(classSchedObj[i][z]);
        }
    }

    var options = {
        valueNames: ["ref", "name", "sec", "title", "cred", "dist", "lim", "instruct", "type", "days", "time", "rm", {name: 'idCopy', attr: "for"/*, forMultiple: true*/}, {name: 'id', attr: 'id'}, "comment", "labelSummary"],
        //Item with labels on ever td, AxE only wants 1 label p/ checkbox
        //item: '<tr> <td> <input type="checkbox" class="longListId id" group="classCheckbox"> </td> <td> <label class="idCopy"> <div class="ref"></div> </label> </td> <td> <label class="idCopy"> <div class="name"></div> </label> </td> <td> <label class="idCopy"> <div class="sec"></div> </label> </td> <td> <label class="idCopy"> <p class="title"></p> </label> <div class="comment"></div> </td> <td> <label class="idCopy"> <div class="cred"></div> </label> </td>  <td> <label class="idCopy"> <div class="dist"></div> </label> </td> <td> <label class="idCopy"> <div class="lim"></div> </label> </td> <td> <label class="idCopy"> <div class="instruct"></div> </label> </td> <td> <label class="idCopy"> <div class="type"></div> </label> </td> <td> <label class="idCopy"> <div class="days"></div> </label> </td> <td> <label class="idCopy"> <div class="time"></div> </label> </td> <td> <label class="idCopy"> <div class="rm"></div> </label> </td> </tr>',
        //W/o labels on all, just on rref number
        item: '<tr class="trClickable"> <td><label><input class="longListId id" type="checkbox"><div class="visuallyhidden labelSummary"></div></label></td> <td> <label class="idCopy"> <div class="ref"> </div> </label> </td> <td> <div class="name"> </div> </td> <td> <div class="sec"> </div> </td> <td> <p class="title"></p> <div class="comment"></div> </td> <td> <div class="cred"> </div> </td> <td> <div class="dist"> </div> </td> <td> <div class="lim"> </div> </td> <td> <div class="instruct"> </div> </td> <td> <div class="type"> </div> </td> <td> <div class="days"> </div> </td> <td> <div class="time"> </div> </td> <td> <div class="rm"> </div> </td> </tr>',
        indexAsync: true
    };


    /* var values = classSchedObj[0].concat(classSchedObj[1])*/
    var hackerList = new List('hacker-list', options, tableArr);
    var searchId   = document.getElementById("search");
    hackerList.on("searchStart", function(){
        if(searchId.value==""){
            document.getElementById("classTable").style.display = "none";
        }else{
            document.getElementById("classTable").style.display = "block";
        }
    })

    $(".trClickable").on("click", function(e){
        //Click checkbox if click row
        c = event;
        if(e.target.type != "checkbox"){
            var cb = $(this).find("input[type=checkbox]")
            cb.trigger("click");
        }
    })

    // page is now ready, initialize the calendar...

    //Can use string comparison to compare because is 24 hour time
    minTime = "09:00:00";
    maxTime = "18:00:00";
    fullCal = $('#calendar').fullCalendar({
        // put your options and callbacks here
        height: 'auto',
        minTime: minTime,
        maxTime: maxTime,
        //maxTime: "23:00:00",
        //contentHeight: 800,
        weekends: false,
        allDaySlot: false,
        //Don't want a header (title, today, etc buttons)
        header: false,
        columnFormat: 'dddd',
        defaultView: 'agendaWeek',
        editable: false,
        eventColor: "purple",
        eventAfterAllRender: function(view){
            var events = $('#calendar').fullCalendar('clientEvents')
            var newMinTime = minTime;
            var newMaxTime = maxTime;

            for(var i in events){
                //Can use string comparison natively
                if(events[i].start.format("HH:mm:ss") < newMinTime){
                    newMinTime = events[i].start.format("HH:mm:ss");
                }
                if(events[i].end.  format("HH:mm:ss") > newMaxTime){
                    newMaxTime = events[i].end.format("HH:mm:ss");
                }
            }
            if(newMinTime!=minTime){
                minTime = newMinTime;
                $("#calendar").fullCalendar('option', { minTime: minTime });
            }
            if(newMaxTime!=maxTime){
                maxTime = newMaxTime;
                $("#calendar").fullCalendar('option', { maxTime: maxTime });
            }
        }
        /* events: json[0]*/
        /* events: [*/
        /* {*/
        /* title  : 'event3',*/
        /* dow: [2],*/
        /* start  : '10:00',*/
        /* end  : '13:00',*/
        /* allDay : false // will make the time show*/
        /* }*/
        /* ]*/
        /* })*/

    });
    $('.longListId').change(longListCallback);
    notFromHash = true;
    if(window.location.hash!==""){

        //Want to show classTable bc there will be classes
        document.getElementById("classTable").style.display = "block";

        var bothHash = window.location.hash.replace("#", "").split(";");
        var hashClasses = bothHash[0].split(",");
        if(bothHash[1]!=null){
            var highlight = bothHash[1].split(",");
        }else{
            highlight = [];
        }
        //needs to be global bc dont want to spam hash event :(
        notFromHash = false;
        for(var q in hashClasses){
            if(hashClasses[q]!=""){
                $("input.longListId#"+hashClasses[q]).prop( "checked", true ).trigger("change");
            }
        }
        notFromHash = true;
        reloadRightCol();
        for(var z in highlight){
            $("input.highlightCheck[value='"+highlight[z]+"']").prop( "checked", true ).trigger("change");
        }
        window.location.hash=Object.keys(classes).join(",")+";"+highlightedClasses.join(",");
    }
})
function longListCallback() {
    // this will contain a reference to the checkbox   
    var id = this.getAttribute("id");
    if (this.checked) {
        if(id in classSchedObj[2]){

            $('#calendar').fullCalendar('addEventSource', [classSchedObj[2][id]]);
            allAddedClassObj[0][id+"extra"] = classSchedObj[2][id];
            /* $('.rightCol').html("<input type='checkbox' id='"+id+"'>"+classSchedObj[2][id].join("\t")+"<br>")*/
        }
        if(id in classSchedObj[1]){
            alert("No set times to meet");
        }else{
            $('#calendar').fullCalendar('addEventSource', [classSchedObj[0][id]]);
            allAddedClassObj[0][id] = classSchedObj[0][id];
            /* $('.rightCol').html("<input type='checkbox' id='"+id+"'>"+classSchedObj[0][id].join("\t")+"<br>")*/
        }
        if(!(id in classes)){
            classes[id] = classSchedObj[0][id];
            if(notFromHash){
                window.location.hash=Object.keys(classes).join(",")+";"+highlightedClasses.join(",");
            }
            reloadRightCol();
        }
    } else {
        $('#calendar').fullCalendar('removeEvents', this.getAttribute("id"));
        delete classes[id];
        delete allAddedClassObj[0][id];
        if(highlightedClasses.indexOf(id)!=-1){
            highlightedClasses.splice(highlightedClasses.indexOf(id), 1);
        }
        if(notFromHash){
            window.location.hash=Object.keys(classes).join(",")+";"+highlightedClasses.join(",");
        }
        if(id in classSchedObj[2]){
            delete allAddedClassObj[0][id+"extra"];
        }
        reloadRightCol();
    }
}

function highlightCallback(){
    var id = this.getAttribute("value");
    if (this.checked) {
        if(id in classSchedObj[2]){
            $('#calendar').fullCalendar('removeEvents', this.getAttribute("value"));
            allAddedClassObj[1][id+"extra"] = classSchedObj[2][id];
            $('#calendar').fullCalendar('addEventSource', {events:[classSchedObj[2][id]], color: "red" });
            /* $('.rightCol').html("<input type='checkbox' id='"+id+"'>"+classSchedObj[2][id].join("\t")+"<br>")*/
        }
        if(id in classSchedObj[1]){
            alert("No set times to meet");
        }else{
            /* $('#calendar').fullCalendar('addEventSource', [classSchedObj[0][id]]);*/
            if(!(id in classSchedObj[2])){
                $('#calendar').fullCalendar('removeEvents', this.getAttribute("value"));
            }
            allAddedClassObj[1][id] = classSchedObj[0][id];
            $('#calendar').fullCalendar('addEventSource', {events:[classSchedObj[0][id]], color: "red" });
            /* $('.rightCol').html("<input type='checkbox' id='"+id+"'>"+classSchedObj[0][id].join("\t")+"<br>")*/
        }
        if(highlightedClasses.indexOf(id)==-1){
            highlightedClasses.push(id);
            window.location.hash=Object.keys(classes).join(",")+";"+highlightedClasses.join(",");
        }
    } else {
        delete allAddedClassObj[1][id];
        $('#calendar').fullCalendar('removeEvents', this.getAttribute("value"));
        highlightedClasses.splice(highlightedClasses.indexOf(id), 1);
        if(id in classSchedObj[2]){
            var addEvent = classSchedObj[2][id];
            delete allAddedClassObj[1][id+"extra"]
            $('#calendar').fullCalendar('removeEvents', this.getAttribute("value"));
            $('#calendar').fullCalendar('addEventSource', {events:[classSchedObj[2][id]]});
            /* $('.rightCol').html("<input type='checkbox' id='"+id+"'>"+classSchedObj[2][id].join("\t")+"<br>")*/
        }
        if(id in classSchedObj[1]){
            alert("No set times to meet");
        }else{
            /* $('#calendar').fullCalendar('addEventSource', [classSchedObj[0][id]]);*/
            if(!(id in classSchedObj[2])){
                $('#calendar').fullCalendar('removeEvents', this.getAttribute("value"));
            }
            $('#calendar').fullCalendar('addEventSource', {events:[classSchedObj[0][id]]});
            /* $('.rightCol').html("<input type='checkbox' id='"+id+"'>"+classSchedObj[0][id].join("\t")+"<br>")*/
        }
        /* delete classes[id]*/
        /* window.location.hash=Object.keys(classes).join(",")*/
        /* reloadRightCol()*/
        window.location.hash=Object.keys(classes).join(",")+";"+highlightedClasses.join(",");
    }
}     


function reloadRightCol(){
    htmlObj = [];
    var html = "";
    for(var i in classes){
        var checked = '';
        if(highlightedClasses.indexOf(i.toString())!=-1){
            checked = 'checked';
        }
        htmlObj.push({key: i, val: "<input type='checkbox' "+checked+" class='highlightCheck' value='"+i+"'><b>"+classes[i].subj+" "+classes[i].num+" "+classes[i].sec+"</b>: "+classes[i].title+" ("+i+")<br>"});
    }
    htmlObj = htmlObj.sort(function (a, b) {
        return a.key.localeCompare( b.key );
    });
    for(var z in htmlObj){
        html+="<label>"+htmlObj[z].val+"</label>";
    }
    $(".rightCol").html(html);
    $('.highlightCheck').off("change").change(highlightCallback);
}
function getReadyForExport(){
    //Show either log out or authorize
    document.getElementById("authorizedButtons").style.display = "block";
    if(authorized){
        //Already authorized, can go right in
        exportToGoogle();
    }
}

function exportToGoogle(){
    //Only export all events, not highlighted
    var addedClassObj = allAddedClassObj[0];
    var events = [];
    for(var i in addedClassObj){
        console.log("-----");
        //need to make a new Obj each time bc will overwrite with set hour
        var startTime = addedClassObj[i].start;
        var endTime = addedClassObj[i].end;

        var dow = JSON.parse(addedClassObj[i].dow).sort();
        console.log(dow);

        var startDate = new Date(startSemesterTime)//.setHours(startTime.substring(0, startTime.indexOf(":")),startTime.substring(startTime.indexOf(":")+1)));
        var endDate =   new Date(startSemesterTime)//.setHours(endTime.substring(0, endTime.indexOf(":")),endTime.substring(endTime.indexOf(":")+1)));

        console.log(addedClassObj[i].title);
        console.log(endDate.getUTCDay());
        console.log(dow[0]);
        var dowWanted = false;
        for(var w = 0; w<dow.length;w++){
            if(endDate.getUTCDay() <= dow[w]){
                dowWanted = dow[w];
                break;
            }
        }
        if(dowWanted == false){
            dowWanted = 7+dow[0];
        }
        /* if(endDate.getUTCDay() > dow[0]){ */
        /*     //i.e. endDate is on tues but the class is a monday class */
        /*     startDate = addDay(startDate, 7-endDate.getUTCDay() + dow[0]) */
        /*     endDate = addDay(endDate, 7-endDate.getUTCDay() + dow[0]) */
        /* }else{ */
        startDate = addDay(startDate,  -endDate.getUTCDay()+dowWanted);
        endDate = addDay(endDate, -endDate.getUTCDay()+ dowWanted);
        /* } */
        startDateISO = totruncateISOString(startDate)+"T"+addedClassObj[i].start+":00";
        endDateISO = totruncateISOString(endDate)+"T"+addedClassObj[i].end+":00";


        /* console.log(addedClassObj[i].start) */
        /* console.log(addedClassObj[i].end) */
        console.log(startDateISO);
        console.log(endDateISO);

        /* var startDateTimeISO = startDate.toISOString() */
        /* startDateTimeISO = startDateTimeISO.substring(0, startDateTimeISO.indexOf(".")) */

        /* var endDateTimeISO = endDate.toISOString() */
        /* endDateTimeISO = endDateTimeISO.substring(0, endDateTimeISO.indexOf(".")) */

        var ByDayRepeat = "";
        var daysArr = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

        for(var z in dow){
            ByDayRepeat+=daysArr[dow[z]]+",";
        }
        //remove last ,
        ByDayRepeat = ByDayRepeat.substring(0,ByDayRepeat.length-1);
        console.log(ByDayRepeat);
        if(addedClassObj[i].comment != ""){
            addedClassObj[i].comment += "\n\n";
        }
        addedClassObj[i].comment += "----\nAnd remember:\n"+randomQuote();
        events.push({
            'summary': addedClassObj[i].title,
            'location': addedClassObj[i].rm,
            'description': addedClassObj[i].comment+"\nEnjoy!",
            'start': {
                'dateTime': startDateISO,
                'timeZone': 'America/New_York'
            },
            'end': {
                'dateTime': endDateISO,
                'timeZone': 'America/New_York'
            },
            'extendedProperties':{
                'private':{
                    'sccsTerm': term
                }
            },
            'recurrence': [
                /* 'EXDATE:'+'20170116,20170117', */
                'RRULE:FREQ=DAILY;BYDAY='+ByDayRepeat+';UNTIL='+endSemesterISO,
                /* "EXDATE:20170124" */
                /* 'EXDATE;TZID=America/New_York:20170117T000000' */
                /* 'EXDATE;VALUE=DATE:20170123T093000' */
            ],
            /* 'reminders': {*/
            /* 'useDefault': false,*/
            /* 'overrides': [*/
            /* {'method': 'email', 'minutes': 24 * 60},*/
            /* {'method': 'popup', 'minutes': 10}*/
            /* ]*/
            /* }*/
        });
    }
    console.log(events);
    console.log(JSON.stringify(events));
    getSCCSCal(events);
}
function addDay(date, days){
    var dat = new Date(date.getTime());
    dat.setDate(dat.getDate() + days);
    return dat;
}

function makeTest(id){
    var event = {
        'calendarId': id,
        'resource': {
            'summary': 'Google I/O 2015',
            'location': '800 Howard St., San Francisco, CA 94103',
            'description': 'A chance to hear more about Google\'s developer products.',
            'start': {
                'dateTime': '2017-01-13T21:21:11',
                'timeZone': 'America/New_York'
            },
            'end': {
                'dateTime': '2017-01-13T21:21:11',
                'timeZone': 'America/New_York'
            },
            'extendedProperties':{
                'private':{
                    'sccsTerm': term
                }
            }
            /* 'recurrence': [*/
            /* 'RRULE:FREQ=DAILY;COUNT=2'*/
            /* ]*/
            /* 'reminders': {*/
            /* 'useDefault': false,*/
            /* 'overrides': [*/
            /* {'method': 'email', 'minutes': 24 * 60},*/
            /* {'method': 'popup', 'minutes': 10}*/
            /* ]*/
            /* }*/
        }
    };

    var makeTestReq = gapi.client.calendar.events.insert(event);
    console.log("make test ");
    makeTestReq.execute(function(resp){
        console.log(resp);
    })
}
function twoDigits(value) {
    return (value < 10 ? '0' : '') + value;
}
function totruncateISOString(date) {
    return date.getUTCFullYear()
        + '-' + twoDigits(date.getUTCMonth() + 1)
        + '-' + twoDigits(date.getUTCDate());
    /* + 'T' + twoDigits(date.getUTCHours()) */
    /* + ':' + twoDigits(date.getUTCMinutes()) */
    /* + ':' + twoDigits(date.getUTCSeconds()) */
    /* + '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) */
    /* + 'Z'; */
};
function toDateStr(date) {
    return date.getUTCFullYear()
        +  twoDigits(date.getUTCMonth() + 1)
        +  twoDigits(date.getUTCDate());
    /* +'T000000Z' */
};
function randomQuote(){
    return quotes[Math.floor(Math.random()*quotes.length)];
}

function getSCCSCal(addEvents) {
    var getCalsReq = gapi.client.calendar.calendarList.list()

    getCalsReq.execute(function(resp) {
        console.log("Get Cal List")
        console.log(resp)
        var needsNewCal = true;
        for(var i in resp.items){
            if(resp.items[i].summary=="SCCS Class Schedule"){
                needsNewCal = false
                sccsSchedCalId = resp.items[i].id
                addToCal(sccsSchedCalId, addEvents)
            }
        }
        if(needsNewCal){
            //needs to make new calendar
            var makeNewCalReq = gapi.client.calendar.calendars.insert({
                'summary': "SCCS Class Schedule"
            })
            makeNewCalReq.execute(function(resp){
                console.log("Make New Cal")
                console.log(resp)
                sccsSchedCalId = resp.result.id
                addToCal(sccsSchedCalId, addEvents)
            })
        }

    });
}
function addToCal(calId, addClass){
    console.log("calID: "+calId)
    var getEventsReq = gapi.client.calendar.events.list({
        'calendarId': calId,
        'maxResults': 2500,
        'privateExtendedProperty': 'sccsTerm='+term,
    })
    getEventsReq.execute(function(resp){
        var batch = gapi.client.newBatch();
        var items = resp.items
        for(var i in items){
            batch.add(gapi.client.calendar.events.delete({
                'calendarId': calId,
                'eventId': items[i].id
            }))
        }
        for(var i in addClass){
            batch.add(gapi.client.calendar.events.insert({
                'calendarId': calId,
                resource: addClass[i]
            }))
        }
        console.log("delete batch")
        batch.execute(function(resp){
            console.log("deleted")
            flashWhite();
            $("#sayHi").append('<br><b>Success!</b> You now have a new calendar called "SCCS Class Schedule" in your Google Calendar with events starting next semester. (You\'ll need to refresh)')
        })
    })
}
//https://developers.google.com/google-apps/calendar/quickstart/js

/**
 *  On load, called to load the auth2 library and API client library.
 */

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        clientId:      CLIENT_ID,
        scope:         SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        document.getElementById("authorize-button").onclick = handleAuthClick;
        document.getElementById("signout-button")  .onclick = handleSignoutClick;

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

        document.getElementById("exportButtons").style.display = "block";
    }, function(error){
        console.log(error)
    })
        .catch(function(e){
            console.log(e)
        })
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    var notAuthorizedDiv = document.getElementById('notAuthorized');
    var isAuthorizedDiv  = document.getElementById('isAuthorized');

    document.getElementById("waitingForGoogle").style.display = "none";

    if (isSignedIn) {
        notAuthorizedDiv.style.display = 'none';
        isAuthorizedDiv .style.display = 'block';

        //Put email so know which calendar
        document.getElementById("sayHi").innerHTML = "Hi, "+gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getGivenName()+"!<br>("+gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail()+")!";

        //If signed in, automatically show all
        document.getElementById("authorizedButtons").style.display = 'block';

        //Set global authorized so know (so that user doesn't have to sign in unless exporting)
        authorized                     = true;
    } else {
        /* wait for getRadyForExport so not too many buttons
        notAuthorizedDiv.style.display = 'block';
        */
        isAuthorizedDiv .style.display = 'none';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}
function handleClientLoad() {
    //https://github.com/google/google-api-javascript-client/issues/265
    gapi.load('client:auth2', {
        callback: initClient,
        onerror: function(e){
            throw e
        }
    });
}

function toggleCal(){
    $("#calContainer").slideToggle("slow");
}

function flashWhite(){
    document.body.classList.add("flashWhite")
    setTimeout(function(){
        document.body.classList.remove("flashWhite")
    }, 700)
}
