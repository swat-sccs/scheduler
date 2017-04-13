var authorized = false;
     var term = "fall17"
     var classes = {}
     var highlightedClasses = []
     var allAddedClassObj = [{},{}]
     //Jan 17 start sem
     //Fall 2017 start sem = Sep 4
     //month and day number are 0 indexed
     var startSemesterTime = Date.UTC(2017,8,4,0,0,0)
     //Apr 28 start sem
     //YEARMONTHDAY+"T000000Z", pad with 0s
        //Dec 12
     var endSemesterISO = "20171212T000000Z"
     var allOrHigh = 0
     var globalFromButton = false
     /* 20170127T000000Z */
         var CLIENT_ID = '590889346032-44j8s8s3368lagbb3f9drn3i4rgc73ld.apps.googleusercontent.com';

         var SCOPES = ["https://www.googleapis.com/auth/calendar"];
         var sccsSchedCalId = ''
         var exceptionDays = ""
         var startSemDate = new Date(startSemesterTime)
        var startSemDay = startSemDate.getUTCDay()
        var i = -1
        for(var q = startSemDay-1; q>=1;q--){
            exceptionDays+=toDateStr(addDay(startSemDate,i))+","
                    i--
        }
exceptionDays = exceptionDays.substring(0,exceptionDays.length-1)

var quotes = ["The cure for boredom is curiosity. There is no cure for curiosity. \n -Ellen Parr", "It always seems impossible until it is done\n - Nelson Mandela", "Education is what survives when what has been learned has been forgotten.\n - BF Skinner", "Everybody is a genius ... But, if you judge a fish by its ability to climb a tree, it will live its whole life believing it is stupid\n - Albert Einstein", "No pressure, no diamonds\n - Thomas Carlyle", "One kind word can change someone's entire day", "When nothing goes right ...  go left"]
     $( document ).ready(function() {
         /* $.getJSON("https://dl.dropboxusercontent.com/u/24397004/Permanent%20To%20Share/classSched.txt", function(json) {*/
         /* console.log(json); // this will show the info it in firebug console*/
         classSchedObj = json
         tableArr = []
         for(var i=0; i<=1; i++){
             for(var z in json[i]){
                 var id = json[i][z].id
                 if(id in json[2]){
                     /* console.log(id)*/
                     json[i][z].type+="<br>"+json[2][id].type
                     json[i][z].days+="<br>"+json[2][id].days
                     json[i][z].time+="<br>"+json[2][id].time
                     json[i][z].rm+="<br>"+json[2][id].rm
                 }
                 tableArr.push(json[i][z])
             }
         }
         

         var options = {
             /* valueNames: ["ref", "subj", "num", "sec", "title", "cred", "dist", "lim", "instruct", "type", "days", "time", "rm", {name: 'id' ,attr:'value'}, "comment"],*/
             valueNames: ["ref", "name", "sec", "title", "cred", "dist", "lim", "instruct", "type", "days", "time", "rm", {name: 'id' ,attr:'value'}, "comment"],
             /* item: '<li><h3 class="title"></h3><p class="ref"></p></li>'*/
             /* item: '<tr><td><input type="checkbox" name="rre" class="longListId id"></td><td class="ref"></td><td class="subj"></td><td class="num"></td><td class="sec"></td><td><p class="title"></p><div class="comment"></div></td><td class="cred"></td><td class="dist"></td><td class="lim"></td><td class="instruct"></td><td class="type"></td><td class="days"></td><td class="time"></td><td class="rm"></td></tr>'*/
             item: '<tr><td><input type="checkbox" name="rre" class="longListId id"></td><td class="ref"></td><td class="name"></td><td class="sec"></td><td><p class="title"></p><div class="comment"></div></td><td class="cred"></td><td class="dist"></td><td class="lim"></td><td class="instruct"></td><td class="type"></td><td class="days"></td><td class="time"></td><td class="rm"></td></tr>',
			indexAsync: true
         };
         
         /* var values = json[0].concat(json[1])*/
         var hackerList = new List('hacker-list', options, tableArr);
		 var searchId = document.getElementById("search");
		 hackerList.on("searchStart", function(){
						 if(searchId.value==""){
						 document.getElementById("classTable").style.display = "none"
						 }else{
						 document.getElementById("classTable").style.display = ""

						 }
						 })

         // page is now ready, initialize the calendar...

         fullCal = $('#calendar').fullCalendar({
             // put your options and callbacks here
             height: 'auto',
             minTime: "08:00:00",
             maxTime: "23:00:00",
			 //contentHeight: 800,
             weekends: false,
             allDaySlot: false,
             header: {
				         left: 'prev,next today',
				         center: 'title',
						 right: ''
			       },
             defaultView: 'agendaWeek',
             editable: false,
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
         notFromHash = true
         if(window.location.hash!==""){

             var bothHash = window.location.hash.replace("#", "").split(";")
             var hashClasses = bothHash[0].split(",")
             if(bothHash[1]!=null){
                 var highlight = bothHash[1].split(",")
             }else{
                 highlight = []
             }
             //needs to be global bc dont want to spam hash event :(
             notFromHash = false
             for(var q in hashClasses){
                 /* console.log(hashClasses[q])*/
                 $("input.longListId[value='"+hashClasses[q]+"']").prop( "checked", true ).trigger("change")
             }
             notFromHash = true
             reloadRightCol()
             for(var z in highlight){
                 $("input.highlightCheck[value='"+highlight[z]+"']").prop( "checked", true ).trigger("change")
             }
             window.location.hash=Object.keys(classes).join(",")+";"+highlightedClasses.join(",")
         }
     })
     function longListCallback() {
         // this will contain a reference to the checkbox   
         var id = this.getAttribute("value")
         if (this.checked) {
             /* console.log(this)*/
             if(id in classSchedObj[2]){
                 /* console.log(classSchedObj[2][id])*/

                 $('#calendar').fullCalendar('addEventSource', [classSchedObj[2][id]]);
                 allAddedClassObj[0][id+"extra"] = classSchedObj[2][id]
                 /* $('.rightCol').html("<input type='checkbox' id='"+id+"'>"+classSchedObj[2][id].join("\t")+"<br>")*/
             }
             if(id in classSchedObj[1]){
                 alert("No set times to meet")
             }else{
                 $('#calendar').fullCalendar('addEventSource', [classSchedObj[0][id]]);
                 allAddedClassObj[0][id] = classSchedObj[0][id]
                 /* $('.rightCol').html("<input type='checkbox' id='"+id+"'>"+classSchedObj[0][id].join("\t")+"<br>")*/
             }
             if(!(id in classes)){
                 classes[id] = classSchedObj[0][id]
                 if(notFromHash){
                     window.location.hash=Object.keys(classes).join(",")+";"+highlightedClasses.join(",")
                 }
                 reloadRightCol()
             }
         } else {
             $('#calendar').fullCalendar('removeEvents', this.getAttribute("value"));
             delete classes[id]
            delete allAddedClassObj[0][id]
            if(highlightedClasses.indexOf(id)!=-1){
             highlightedClasses.splice(highlightedClasses.indexOf(id), 1)
            }
             if(notFromHash){
                 window.location.hash=Object.keys(classes).join(",")+";"+highlightedClasses.join(",")
             }
             if(id in classSchedObj[2]){
            delete allAddedClassObj[0][id+"extra"]
             }
             reloadRightCol()
         }
     }

     function highlightCallback(){
         var id = this.getAttribute("value")
         if (this.checked) {
             b = this
             /* console.log(this)*/
             if(id in classSchedObj[2]){
                 /* console.log(classSchedObj[2][id])*/
                 $('#calendar').fullCalendar('removeEvents', this.getAttribute("value"));
                 allAddedClassObj[1][id+"extra"] = classSchedObj[2][id]
                 $('#calendar').fullCalendar('addEventSource', {events:[classSchedObj[2][id]], color: "red" });
                 /* $('.rightCol').html("<input type='checkbox' id='"+id+"'>"+classSchedObj[2][id].join("\t")+"<br>")*/
             }
             if(id in classSchedObj[1]){
                 alert("No set times to meet")
             }else{
                 /* $('#calendar').fullCalendar('addEventSource', [classSchedObj[0][id]]);*/
                 if(!(id in classSchedObj[2])){
                     $('#calendar').fullCalendar('removeEvents', this.getAttribute("value"));
                 }
                 allAddedClassObj[1][id] = classSchedObj[0][id]
                 $('#calendar').fullCalendar('addEventSource', {events:[classSchedObj[0][id]], color: "red" });
                 /* $('.rightCol').html("<input type='checkbox' id='"+id+"'>"+classSchedObj[0][id].join("\t")+"<br>")*/
             }
             if(highlightedClasses.indexOf(id)==-1){
                 highlightedClasses.push(id)
                 window.location.hash=Object.keys(classes).join(",")+";"+highlightedClasses.join(",")
             }
         } else {
             delete allAddedClassObj[1][id]
             $('#calendar').fullCalendar('removeEvents', this.getAttribute("value"));
             highlightedClasses.splice(highlightedClasses.indexOf(id), 1)
             if(id in classSchedObj[2]){
                 /* console.log(classSchedObj[2][id])*/
                 var addEvent = classSchedObj[2][id]
                 delete allAddedClassObj[1][id+"extra"]
                 $('#calendar').fullCalendar('removeEvents', this.getAttribute("value"));
                 $('#calendar').fullCalendar('addEventSource', {events:[classSchedObj[2][id]]});
                 /* $('.rightCol').html("<input type='checkbox' id='"+id+"'>"+classSchedObj[2][id].join("\t")+"<br>")*/
             }
             if(id in classSchedObj[1]){
                 alert("No set times to meet")
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
             window.location.hash=Object.keys(classes).join(",")+";"+highlightedClasses.join(",")
         }
     }     

     
     function reloadRightCol(){
         htmlObj = []         
         var html = ""
         for(var i in classes){
             var checked = '' 
             if(highlightedClasses.indexOf(i.toString())!=-1){
                 checked = 'checked'
             }
             htmlObj.push({key: classes[i].subj+classes[i].num, val: "<input type='checkbox' "+checked+" class='highlightCheck' value='"+i+"'>"+classes[i].subj+" "+classes[i].num+" "+classes[i].sec+": "+classes[i].title+"<br>"})
         }
         htmlObj = htmlObj.sort(function (a, b) {
             return a.key.localeCompare( b.key );
         });
         for(var z in htmlObj){
             html+="<label>"+htmlObj[z].val+"</label>"
         }
         $(".rightCol").html(html)
         $('.highlightCheck').off("change").change(highlightCallback)
     }
function getReadyForExport(index){
             allOrHigh = index
             if(authorized ){
             exportToGoogle()
             }else{
             document.getElementById("authorize").style.display = ""

}
}

     function exportToGoogle(){
        var addedClassObj = allAddedClassObj[allOrHigh]
                var events = []
         for(var i in addedClassObj){
                                   console.log("-----")
             //need to make a new Obj each time bc will overwrite with set hour
             var startTime = addedClassObj[i].start
             var endTime = addedClassObj[i].end

             var dow = JSON.parse(addedClassObj[i].dow).sort()
console.log(dow)

             var startDate = new Date(startSemesterTime)//.setHours(startTime.substring(0, startTime.indexOf(":")),startTime.substring(startTime.indexOf(":")+1)))
             var endDate =   new Date(startSemesterTime)//.setHours(endTime.substring(0, endTime.indexOf(":")),endTime.substring(endTime.indexOf(":")+1)))

console.log(addedClassObj[i].title)
             console.log(endDate.getUTCDay())
             console.log(dow[0])
             var dowWanted = false
             for(var w = 0; w<dow.length;w++){
                     if(endDate.getUTCDay() <= dow[w]){
                        dowWanted = dow[w];
                        break
                     }
             }
                                   if(dowWanted == false){
                                           dowWanted = 7+dow[0]
                                   }
             /* if(endDate.getUTCDay() > dow[0]){ */
             /*     //i.e. endDate is on tues but the class is a monday class */
             /*     startDate = addDay(startDate, 7-endDate.getUTCDay() + dow[0]) */
             /*     endDate = addDay(endDate, 7-endDate.getUTCDay() + dow[0]) */
             /* }else{ */
                 startDate = addDay(startDate,  -endDate.getUTCDay()+dowWanted)
                 endDate = addDay(endDate, -endDate.getUTCDay()+ dowWanted)
             /* } */
             startDateISO = totruncateISOString(startDate)+"T"+addedClassObj[i].start+":00"
             endDateISO = totruncateISOString(endDate)+"T"+addedClassObj[i].end+":00"


            /* console.log(addedClassObj[i].start) */
            /* console.log(addedClassObj[i].end) */
             console.log(startDateISO)
             console.log(endDateISO)

             /* var startDateTimeISO = startDate.toISOString() */
             /* startDateTimeISO = startDateTimeISO.substring(0, startDateTimeISO.indexOf(".")) */

             /* var endDateTimeISO = endDate.toISOString() */
             /* endDateTimeISO = endDateTimeISO.substring(0, endDateTimeISO.indexOf(".")) */

             var ByDayRepeat = ""
             var daysArr = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]

             for(var z in dow){
                ByDayRepeat+=daysArr[dow[z]]+","
             }
//remove last ,
            ByDayRepeat = ByDayRepeat.substring(0,ByDayRepeat.length-1)
            console.log(ByDayRepeat)
			if(addedClassObj[i].comment != ""){
					addedClassObj[i].comment += "\n\n"
			}
			addedClassObj[i].comment += "----\nAnd remember:\n"+randomQuote()
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
             })
         }
         console.log(events)
         console.log(JSON.stringify(events))
         addClass = events
         getSCCSCal(events)
     }
     function addDay(date, days){
         var dat = new Date(date.getTime());
         dat.setDate(dat.getDate() + days);
         return dat;
     }
         function checkAuth() {
             gapi.auth.authorize(
                 {
                     'client_id': CLIENT_ID,
                     'scope': SCOPES.join(' '),
                     'immediate': true
                 }, handleAuthResult);
         }

         /**
          * Handle response from authorization server.
          *
          * @param {Object} authResult Authorization result.
          */
         function handleAuthResult(authResult, fromButton) {
             var authorizeDiv = document.getElementById('authorize-div');
             if (authResult && !authResult.error) {
                 // Hide auth UI, then load client library.
                 authorizeDiv.style.display = 'none';
                 //needs to be global
                 console.log(fromButton)
                 globalFromButton = fromButton
                 loadCalendarApi();
               authorized = true

             } else {
                 // Show auth UI, allowing the user to initiate authorization by
                 // clicking authorize button.
                 authorizeDiv.style.display = 'inline';
             }
         }

         /**
          * Initiate auth flow in response to user clicking authorize button.
          *
          * @param {Event} event Button click event.
          */
         function handleAuthClick(event) {
             gapi.auth.authorize(
                 {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
                 handleAuthCheckButton);
             return false;
         }
function handleAuthCheckButton(authResult){
        handleAuthResult(authResult, true)
}

         /**
          * Load Google Calendar client library. List upcoming events
          * once client library is loaded.
          */
         function loadCalendarApi() {
             /* gapi.client.load('calendar', 'v3', getSCCSCal); */
                            console.log(globalFromButton)
                 gapi.client.load('calendar', 'v3', function(){
                         //TDD
                    console.log("read for action")
                            console.log(globalFromButton)
                            if(globalFromButton){
                    exportToGoogle()


                 }
                 });
         }
         function getSCCSCal(addEvents) {
             /* sccsSchedCalId = 'swarthmore.edu_0ha19taudgvpckfmel7okbq6ic@group.calendar.google.com' */
             /* addToCal(sccsSchedCalId, addEvents) */
             /* makeTest(sccsSchedCalId)*/
             /* makeTest(sccsSchedCalId)*/
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
             console.log("getEvents")
             getEventsReq.execute(function(resp){
             var batch = gapi.client.newBatch();
             console.log("got")
                 console.log(resp)
                 var items = resp.items
             console.log("items "+JSON.stringify(items))
                 for(var i in items){
                     batch.add(gapi.client.calendar.events.delete({
                         'calendarId': calId,
                         'eventId': items[i].id
                     }))
                     console.log(items[i])
                 }
             console.log("classes "+JSON.stringify(addClass))
                 for(var i in addClass){
                     batch.add(gapi.client.calendar.events.insert({
                         'calendarId': calId,
                         resource: addClass[i]
                     }))
                 }
                 console.log("delete batch")
                 batch.execute(function(resp){
                         console.log("deleted")
                     console.log(resp)
                             $("#exportReady").append('<br><b>Success! You now have a new calendar called "SCCS Class Schedule" in your Google Calendar with events starting next semester, September 4. (you\'ll need to refresh) </b><br>')
                 })
             })
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
             }

             var makeTestReq = gapi.client.calendar.events.insert(event)
             console.log("make test ")
             makeTestReq.execute(function(resp){
                 console.log(resp)
             })
         }
         /* var request = gapi.client.calendar.events.list({ */
         /*   'calendarId': 'primary', */
         /*   'timeMin': (new Date()).toISOString(), */
         /*   'showDeleted': false, */
         /*   'singleEvents': true, */
         /*   'maxResults': 10, */
         /*   'orderBy': 'startTime' */
         /* }); */
         
         /* request.execute(function(resp) { */
         /*   var events = resp.items; */
         /*   appendPre('Upcoming events:'); */

         /*   if (events.length > 0) { */
         /*     for (i = 0; i < events.length; i++) { */
         /*       var event = events[i]; */
         /*       var when = event.start.dateTime; */
         /*       if (!when) { */
         /*         when = event.start.date; */
         /*       } */
         /*       appendPre(event.summary + ' (' + when + ')') */
         /*     } */
         /*   } else { */
         /*     appendPre('No upcoming events found.'); */
         /*   } */

         /* }); */

         /**
          * Append a pre element to the body containing the given message
          * as its text node.
          *
          * @param {string} message Text to be placed in pre element.
          */
         function appendPre(message) {
             var pre = document.getElementById('output');
             var textContent = document.createTextNode(message + '\n');
             pre.appendChild(textContent);
         }
function twoDigits(value) {
 return (value < 10 ? '0' : '') + value;
}
function totruncateISOString(date) {
      return date.getUTCFullYear()
        + '-' + twoDigits(date.getUTCMonth() + 1)
        + '-' + twoDigits(date.getUTCDate())
        /* + 'T' + twoDigits(date.getUTCHours()) */
        /* + ':' + twoDigits(date.getUTCMinutes()) */
        /* + ':' + twoDigits(date.getUTCSeconds()) */
        /* + '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) */
        /* + 'Z'; */
    };
function toDateStr(date) {
      return date.getUTCFullYear()
        +  twoDigits(date.getUTCMonth() + 1)
        +  twoDigits(date.getUTCDate())
        /* +'T000000Z' */
    };
function revealExport(){
        checkAuth()
               document.getElementById("exportReady").style.display = ""
}

function randomQuote(){
return quotes[Math.floor(Math.random()*quotes.length)];
}
