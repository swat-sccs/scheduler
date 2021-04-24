// TODO REDO EVERY SEMESTER SO GOOGLE CALENDAR ONLY CLEARS OUT MOST RECENT
/* UPDATE NEW SEMESTER section */
// helps gCal disambiguate each semester's events so can delete only the newest semeter if change schedule
const term = 'fall21'
const termSubtitle = 'Fall 2021' // used as text for #semester-subtitle in index.html

// Tricoschedule may not be updated when the schedule first comes out
// If this is the case, use the xls scraped
const schedule_json = 'js/trico_scraped.json'
// const schedule_json = 'js/xls_scraped.json'

// Go to https://www.swarthmore.edu/registrar/five-year-calendar and fill in
// month number are 0 indexed! so -1
// test in javascript console by doing `new Date(... below ...)`
const startSemesterTime = Date.UTC(2021, 7, 30, 0, 0, 0)

// Just change the part before "T" as normal, not 0 indexed
// Inclusive but needs to be at T235959Z so gets whole day when ends (can also be the next day (exclusive)T000000Z but that isn't ideal if have whole-day events)
// TODO known issue with timezones (Z is UTC) for late running events on the last day
const endSemesterISO = '20211218T235959Z'

/* end UPDATE NEW SEMESTER section */

let selectedClasses = []
let classSchedObj
const CLIENT_ID = '67188111758-2l0sr7lpabrkbpbc7nen9ktnk5u71oc3.apps.googleusercontent.com'
const API_KEY = '3q3gVoDEjU8KVeTKBAxAGnyF'
// Can't be readonly scope because needs to be able to create cals and change events
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly'
let authorized = false
// Needs to be global so can i.e. search from the window location hash
let hackerList
let fullCal
// Needs to be global so hacker list can tell when classes do not fit
// TODO too long?
const daysTimesRanges = [[], [], [], [], [], [], [], []]

const startSemDate = new Date(startSemesterTime)
/* TODO add holidays manually
   var exceptionDays = "";
   var i = -1;
   for(var q = startSemDate.getUTCDay()-1; q>=1;q--){
   exceptionDays+=toDateStr(addDay(startSemDate,i))+",";
   i--;
   }
   exceptionDays = exceptionDays.substring(0,exceptionDays.length-1);
 */
const quotes = ['The cure for boredom is curiosity. There is no cure for curiosity. \n -Ellen Parr', 'It always seems impossible until it is done\n - Nelson Mandela', 'Education is what survives when what has been learned has been forgotten.\n - BF Skinner', 'Everybody is a genius ... But, if you judge a fish by its ability to climb a tree, it will live its whole life believing it is stupid\n - Albert Einstein', 'No pressure, no diamonds\n - Thomas Carlyle', "One kind word can change someone's entire day", 'When nothing goes right ...  go left']
const normalEventColor = '#31425F'
const highlightEventColor = '#6bec69'

function initList(tableArr) {
  // Initialize hacker news
  const hackerListOptions = {
    valueNames: ['ref', 'subj', 'numSec', 'c_title', 'cred', 'dist', 'lim', 'instruct', 'days', 'time', 'rm', {
      name: 'idCopy',
      attr: 'for'
    }, {
      name: 'id',
      attr: 'id'
    }, {
      name: 'URL',
      attr: 'href'
    },
    'comment', 'labelSummary'],
    // W/o labels on all, just on rref number
    item: '<tr class="trClickable"> <td><label><input class="id" type="checkbox"><div class="visuallyhidden labelSummary"></div></div></label></td> <td> <div class="ref"> </div><a target="_blank" class="URL icon-link"></a> </td> <td> <div class="subj"> </div> </td> <td> <div class="numSec"> </div> </td> <td> <p class="c_title"></p> <div class="comment"></div> </td> <td> <div class="cred"> </div> </td> <td> <div class="dist"> </div> </td> <td> <div class="lim"> </div> </td> <td> <div class="instruct"> </div> </td> <td> <div class="days"> </div> </td> <td> <div class="time"> </div> </td> <td> <div class="rm"> </div> </td> </tr>',
    indexAsync: true
    // Can't do pagination because doesn't allow to modify the elements (check the checkbox)
  }
  hackerList = new List('hacker-list', hackerListOptions, tableArr)
  hackerList.on('searchComplete', function () {
    if (hackerList.visibleItems.length === 0) {
      document.getElementById('classTable').classList.add('hideClass')
      document.getElementById('search').classList.add('searchMargin')
    } else {
      document.getElementById('classTable').classList.remove('hideClass')
      document.getElementById('search').classList.remove('searchMargin')
    }
  })
  for (let i = 0; i < hackerList.items.length; i++) {
    $(hackerList.items[i].elm).on('click', rowClickHandler)
  }
}

function initCalendar() {
  // page is now ready, initialize the calendar...
  // Can use string comparison to compare because is 24 hour time
  let minTime = '09:00:00'
  let maxTime = '16:00:00'
  fullCal = $('#calendar').fullCalendar({
    // put your options and callbacks here
    height: 'auto',
    minTime: minTime,
    maxTime: maxTime,
    weekends: false,
    allDaySlot: false,
    // Don't want a header (title, today, etc buttons)
    header: false,
    columnFormat: 'dddd',
    defaultView: 'agendaWeek',
    editable: false,
    eventColor: normalEventColor,
    eventAfterAllRender: function (view) {
      const events = $('#calendar').fullCalendar('clientEvents')
      let newMinTime = minTime
      let newMaxTime = maxTime
      // TODO weekend?
      for (const i in events) {
        // Can use string comparison natively
        if (events[i].start.format('HH:mm:ss') < newMinTime) {
          newMinTime = events[i].start.format('HH:mm:ss')
        }
        if (events[i].end.format('HH:mm:ss') > newMaxTime) {
          newMaxTime = events[i].end.format('HH:mm:ss')
        }
      }
      if (newMinTime !== minTime) {
        minTime = newMinTime
        $('#calendar').fullCalendar('option', {
          minTime: minTime
        })
      }
      if (newMaxTime !== maxTime) {
        maxTime = newMaxTime
        $('#calendar').fullCalendar('option', {
          maxTime: maxTime
        })
      }
    },
    eventRender: function (event, element) {
      element[0].children[0].children[1].innerHTML = '<b>' + event.subj + ' ' + event.numSec + '</b>: ' + event.c_title
    }
  })
}

function selectClass(id, bulk) {
  // If bulk, don't save to cookie/hash so don't hammer in initial load
  // this will contain a reference to the checkbox

  // Selected a new class
  if (selectedClasses.indexOf(id) === -1) {
    const thisClass = classSchedObj[0][id]
    // in classSchedObj[0] so not in classSchedObj[1] so has a time
    if (thisClass != null) {
      if (thisClass.multiTime != null) {
        $('#calendar').fullCalendar('addEventSource', {
          id: id,
          events: [thisClass, thisClass.multiTime]
        })
      } else {
        $('#calendar').fullCalendar('addEventSource', {
          id: id,
          events: [thisClass]
        })
      }
    }

    selectedClasses.push(id)
  } else {
    // selected an old class (if multitime, will delete both TODO)
    const thisClass = classSchedObj[0][id]
    // in classSchedObj[0] so not in classSchedObj[1] so has a time
    if (thisClass != null) {
      $('#calendar').fullCalendar('removeEventSource', id)
      thisClass.highlighted = false
    }

    selectedClasses.splice(selectedClasses.indexOf(id), 1)

    // If deleting in bulk, then can do one for loop
    // Technically, this doesn't work if you are doing a bulk select which
    // invovles *both* addition and removal of classes but, we only use bulk
    // when initally adding all classes (all adds) or removing all classes
    // (all removes) so should be safe
    if (!bulk) {
      for (const item in hackerList.items) {
        if (parseInt(hackerList.items[item].values().id) === id) {
          console.log('FOUND IT ' + item)
          hackerList.items[item].elm.children[0].children[0].children[0].checked = false
          hackerList.items[item].elm.classList.remove('trHigh')
        }
      }
    }
  }
  if (!bulk) {
    // generateDayTimeRanges();
    reloadRightCol()
    updateHashCookie()
  }
}

function rowClickHandler(event) {
  const classID = parseInt(event.currentTarget.getElementsByClassName('id')[0].id)
  event.currentTarget.querySelector('input').checked = true
  event.currentTarget.classList.add('trHigh')
  selectClass(classID, false)
}

function rowCheckboxHandler(event) {
  // never called but might be needed for some browsers
  const classID = parseInt(event.currentTarget.id)

  selectClass(classID, false)
  // Stop DOM bubbling up to hit rowClickHandler event (will be
  // caught by its if statement but simplifies logic)
  event.stopPropagation()
}

function loadInitURL() {
  const hashArray = window.location.hash.replace('#', '').replace(/.*__/, '').split(',')
  const hashClasses = []
  const highlighedClasses = []
  for (let i = 0; i < hashArray.length; i++) {
    if (hashArray[i] === '') {
      continue
    }
    if (hashArray[i].slice(-1) === '_') {
      const classId = hashArray[i].replace('_', '')
      hashClasses.push(classId)
      highlighedClasses.push(classId)
    } else {
      hashClasses.push(hashArray[i])
    }
  }

  // Check all the boxes for these items w/in the hacker list (and, while
  // we're there, `select' these classes)
  for (const item in hackerList.items) {
    if (hashClasses.indexOf(hackerList.items[item].values().id) !== -1) {
      // Check the checkbox for this list item, doesn't call the callback
      // because, for now, nothing is shown (just startup)
      console.log(item)
      hackerList.items[item].elm.children[0].children[0].children[0].checked = true
      // TODO don't update hash values for these bc wasteful
      // TODO don't update rightcol, do it afterward
      hackerList.items[item].elm.classList.add('trHigh')
      hackerList.items[item].elm.children[0].children[0].children[0].checked = true
      selectClass(parseInt(hackerList.items[item].values().id), true)
    }
  }
  for (let i = 0; i < highlighedClasses.length; i++) {
    highlightClass(highlighedClasses[i], true)
  }
  reloadRightCol()
  updateHashCookie()
  // TODO generateDayTimeRanges();
}

function loadInitCookie() {
  // TODO
  const cookieStr = Cookies.get('classes')
  if (cookieStr != null) {
    console.log('Taking from cookie')
    window.location.hash = cookieStr
    loadInitURL()
  }
}

// TODO
function urlChangeHandler() {
}

function setHash(hash) {
  if ('replaceState' in history) {
    history.replaceState('', '', hash)
  } else {
    window.location.hash = hash
  }
}

function updateHashCookie() {
  const hashStrArr = []
  for (let i = 0; i < selectedClasses.length; i++) {
    let classStr = selectedClasses[i]
    // If has mult
    if ((selectedClasses[i] in classSchedObj[0] && classSchedObj[0][selectedClasses[i]].highlighted === true) ||
           (selectedClasses[i] in classSchedObj[1] && classSchedObj[1][selectedClasses[i]].highlighted === true)) {
      classStr += '_'
    }
    hashStrArr.push(classStr)
  }
  // So when adds in, keeps most of the order
  hashStrArr.sort()
  const hashStr = term + '__' + hashStrArr.join(',')
  if (hashStrArr.length > 0) {
    setHash('#' + hashStr)
  } else {
    // . clears
    setHash('#')
  }
  Cookies.set('classes', hashStr, { expires: 365 })
}

initCalendar()

MicroModal.init()

document.getElementById('semester-subtitle').textContent = termSubtitle

$.getJSON(schedule_json, function (data) {
  // classSchedObj from included schedule.js file (made with `doAll` in folder)
  // classSchedObj = [hasTimes, hasNoTimes, multipleTimes]
  classSchedObj = data
  const tableArr = []

  // Do normal hasTimes and hasNoTimes. multipleTimes is checked when added to see if exists
  for (let i = 0; i <= 1; i++) {
    for (const z in classSchedObj[i]) {
      const id = classSchedObj[i][z].id
      // classSchedObj[i][z].idCopy = id;
      // TODO what should the ADA label be?
      classSchedObj[i][z].labelSummary = classSchedObj[i][z].ref + ' ' + classSchedObj[i][z].subj + classSchedObj[i][z].numSec
      // In multipleTimes so add below the main item

      classSchedObj[i][z].multipleTimes = null
      classSchedObj[i][z].highlighted = false
      classSchedObj[i][z].title = classSchedObj[i][z].subj + ' ' + classSchedObj[i][z].numSec + ': ' + classSchedObj[i][z].c_title

      if (id in classSchedObj[2]) {
        classSchedObj[i][z].days += '<br>' + classSchedObj[2][id].days
        classSchedObj[i][z].time += '<br>' + classSchedObj[2][id].time

        classSchedObj[i][z].multiTime = classSchedObj[2][id]
        // Needed for calendar to know how to delete
        classSchedObj[i][z].multiTime.id += 'extra'
        classSchedObj[i][z].multiTime.title = classSchedObj[i][z].title
      }
      tableArr.push(classSchedObj[i][z])
    }
  }

  initList(tableArr)
  // Prioritize URL over cookie
  if (window.location.hash !== '') {
    // Make sure is new style URL and is for this term
    // TODO be able to look at previous semesters?
    // If old style or for old term, clear hash

    loadInitURL()
  } else {
    loadInitCookie()
  }
})

function highlightClass(id, bulk) {
  // if bulk, don't change cookie/hash (from beginning)
  let thisClass = classSchedObj[0][id]
  if (thisClass != null) {
    // Add highlight, if has time
    $('#calendar').fullCalendar('removeEventSource', id)
    if (!thisClass.highlighted) {
      if (thisClass.multiTime != null) {
        $('#calendar').fullCalendar('addEventSource', {
          id: id,
          color: highlightEventColor,
          textColor: '#222',
          events: [thisClass, thisClass.multiTime]
        })
      } else {
        $('#calendar').fullCalendar('addEventSource', {
          id: id,
          color: highlightEventColor,
          textColor: '#222',
          events: [thisClass]
        })
      }
    } else {
      if (thisClass.multiTime != null) {
        $('#calendar').fullCalendar('addEventSource', {
          id: id,
          events: [thisClass, thisClass.multiTime]
        })
      } else {
        $('#calendar').fullCalendar('addEventSource', {
          id: id,
          events: [thisClass]
        })
      }
    }
  } else {
    // Has no time
    thisClass = classSchedObj[1][id]
  }
  if (thisClass != null) {
    thisClass.highlighted = !thisClass.highlighted
  }

  if (!bulk) {
    updateHashCookie()
    reloadRightCol()
  }
}

function highlightCallback(event) {
  const clickedElemVal = parseInt(event.currentTarget.value)
  highlightClass(clickedElemVal, false)
}

function trashCallback(event) {
  const clickedElemVal = parseInt(event.currentTarget.value)
  selectClass(clickedElemVal, false)
}

function reloadRightCol() {
  let htmlObj = []
  let html = ''
  for (let i = 0; i < selectedClasses.length; i++) {
    let noTime = ''
    let boldClass = ''
    let highlightClass = ''
    let thisClass = classSchedObj[0][selectedClasses[i]]

    // No time
    if (thisClass == null) {
      thisClass = classSchedObj[1][selectedClasses[i]]
      noTime = ' - <i>No&nbsp;Set&nbsp;Time</i>'
    }
    if (thisClass == null) {
      // Abort! - neither no time or one time
      continue
    }

    if (thisClass.highlighted) {
      boldClass = 'bold'
      highlightClass = 'highlight'
    }
    htmlObj.push({
      key: thisClass.subj + thisClass.numSec,
      val: "<div class='chosenClass'><button class='icon_button icon-trash-1' aria-label='remove class' value='" + thisClass.id + "'></button><button aria-label='highlight class' class='icon_button icon-brush " + highlightClass + "' value='" + thisClass.id + "'></button><span><span class='" + boldClass + " chosenClassLeft'>" + thisClass.subj + ' ' + thisClass.numSec + ": </span><span class='chosenClassRight'>" + thisClass.c_title + noTime + '&nbsp;(' + thisClass.id + ')</span></span></div>'
    })
  }
  htmlObj = htmlObj.sort(function (a, b) {
    return a.key.localeCompare(b.key)
  })
  for (const z in htmlObj) {
    // For button, don't need label
    // html += "<label>" + htmlObj[z].val + "</label>";
    html += htmlObj[z].val
  }
  if (html === '') {
    $('#clearAll_par').html('')
    // Also change in HTML so loads immeditatley
    $('#rightCol').html('Search for classes below to plan your schedule')
  } else {
    $('#clearAll_par').html("<div id='clearClasses' onclick='clearAll()'><b>CLEAR<b></div>")
    $('#rightCol').html(html)
  }

  if (htmlObj.length !== 0) {
    $('#rightCol').addClass('multiCol')
  } else {
    $('#rightCol').removeClass('multiCol')
  }
  $('.icon-brush').click(highlightCallback)
  $('.icon-trash-1').click(trashCallback)
}

function getReadyForExport() {
  // Show either log out or authorize
  if (authorized) {
    // Already authorized, can go right in
    exportToGoogle()
  }
}

function exportToGoogle() {
  // Only export all events, not highlighted

  // Keep track of what classes have no time (so not exported) so can show in modal
  const noTimeClasses = []

  const events = []
  for (let i = 0; i < selectedClasses.length; i++) {
    let thisClass = classSchedObj[0][selectedClasses[i]]
    // This class doesn't have a time
    if (thisClass == null) {
      // Try the no_times category and, if find one, add to noTimeClasses
      thisClass = classSchedObj[1][selectedClasses[i]]
      if (thisClass != null) {
        noTimeClasses.push(thisClass.title)
      }
      // either way, don't export
      continue
    }
    // need to make a new Obj each time bc will overwrite with set hour
    const startTime = thisClass.start
    const endTime = thisClass.end
    const dow = JSON.parse(thisClass.dow).sort()
    console.log(dow)
    let startDate = new Date(startSemesterTime)
    let endDate = new Date(startSemesterTime)
    console.log(thisClass.title)
    console.log(endDate.getUTCDay())
    console.log(dow[0])
    let dowWanted = false
    for (let w = 0; w < dow.length; w++) {
      if (endDate.getUTCDay() <= dow[w]) {
        dowWanted = dow[w]
        break
      }
    }
    if (dowWanted === false) {
      dowWanted = 7 + dow[0]
    }
    startDate = addDay(startDate, -endDate.getUTCDay() + dowWanted)
    endDate = addDay(endDate, -endDate.getUTCDay() + dowWanted)
    const startDateISO = totruncateISOString(startDate) + 'T' + startTime + ':00'
    const endDateISO = totruncateISOString(endDate) + 'T' + endTime + ':00'

    const byDayRepeatArr = []
    const daysArr = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
    for (const z in dow) {
      byDayRepeatArr.push(daysArr[dow[z]])
    }
    const ByDayRepeat = byDayRepeatArr.join(',')
    console.log(ByDayRepeat)
    let thisComment = thisClass.comment
    if (thisComment !== '') {
      thisComment += '\n\n'
    }
    thisComment += '----\nAnd remember:\n' + randomQuote() + '\nEnjoy!'
    events.push({
      summary: thisClass.title,
      location: thisClass.rm,
      description: thisComment,
      start: {
        dateTime: startDateISO,
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: endDateISO,
        timeZone: 'America/New_York'
      },
      extendedProperties: {
        private: {
          sccsTerm: term
        }
      },
      recurrence: [
        'RRULE:FREQ=DAILY;BYDAY=' + ByDayRepeat + ';UNTIL=' + endSemesterISO
      ]
    })
  }
  console.log(events)
  getSCCSCal(events, noTimeClasses)
}

function addDay(date, days) {
  const dat = new Date(date.getTime())
  dat.setDate(dat.getDate() + days)
  return dat
}

function makeTest(id) {
  const event = {
    calendarId: id,
    resource: {
      summary: 'Google I/O 2015',
      location: '800 Howard St., San Francisco, CA 94103',
      description: 'A chance to hear more about Google\'s developer products.',
      start: {
        dateTime: '2017-01-13T21:21:11',
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: '2017-01-13T21:21:11',
        timeZone: 'America/New_York'
      },
      extendedProperties: {
        private: {
          sccsTerm: term
        }
      }
    }
  }
  const makeTestReq = gapi.client.calendar.events.insert(event)
  console.log('make test ')
  makeTestReq.execute(function (resp) {
    console.log(resp)
  })
}

function twoDigits(value) {
  return (value < 10 ? '0' : '') + value
}

function totruncateISOString(date) {
  return date.getUTCFullYear() + '-' + twoDigits(date.getUTCMonth() + 1) + '-' + twoDigits(date.getUTCDate())
};

function toDateStr(date) {
  return date.getUTCFullYear() + twoDigits(date.getUTCMonth() + 1) + twoDigits(date.getUTCDate())
};

function randomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)]
}

function getSCCSCal(addEvents, noTimeClasses) {
  const getCalsReq = gapi.client.calendar.calendarList.list()
  getCalsReq.execute(function (resp) {
    console.log('Get Cal List')
    console.log(resp)
    let needsNewCal = true
    for (const i in resp.items) {
      if (resp.items[i].summary === 'SCCS Class Schedule') {
        needsNewCal = false
        const sccsSchedCalId = resp.items[i].id
        addToCal(sccsSchedCalId, addEvents, noTimeClasses)
      }
    }
    if (needsNewCal) {
      // needs to make new calendar
      const makeNewCalReq = gapi.client.calendar.calendars.insert({
        summary: 'SCCS Class Schedule'
      })
      makeNewCalReq.execute(function (resp) {
        console.log('Make New Cal')
        console.log(resp)
        const sccsSchedCalId = resp.result.id
        addToCal(sccsSchedCalId, addEvents, noTimeClasses)
      })
    }
  })
}

const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']
const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function dateToString(d) {
  return days[d.getUTCDay()] + ' ' + months[d.getUTCMonth()] + ' ' + d.getUTCDate() + ' ' + d.getUTCFullYear()
}

function addToCal(calId, addClass, noTimeClasses) {
  console.log('calID: ' + calId)
  const getEventsReq = gapi.client.calendar.events.list({
    calendarId: calId,
    maxResults: 2500,
    privateExtendedProperty: 'sccsTerm=' + term
  })
  getEventsReq.execute(function (resp) {
    const batch = gapi.client.newBatch()
    const items = resp.items
    for (const i in items) {
      batch.add(gapi.client.calendar.events.delete({
        calendarId: calId,
        eventId: items[i].id
      }))
    }
    for (const i in addClass) {
      batch.add(gapi.client.calendar.events.insert({
        calendarId: calId,
        resource: addClass[i]
      }))
    }
    console.log('delete batch')
    batch.execute(function (resp) {
      console.log('deleted')
      const email = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail()

      let exportHtml = 'You now have a new calendar called <b>SCCS Class Schedule</b> in your ' + email + ' Google Calendar with events starting at the beginning of the semester (' + dateToString(startSemDate) + ').'
      if (noTimeClasses.length !== 0) {
        let classClasses = 'The following classes have no registered time so were not exported'
        if (noTimeClasses.length === 1) {
          classClasses = 'The following class has no registered time so was not exported'
        }
        exportHtml += '<br><br>' + classClasses + ':<ul>'
        for (let i = 0; i < noTimeClasses.length; i++) {
          exportHtml += '<li>' + noTimeClasses + '</li>'
        }
        exportHtml += '</ul>'
      }
      $('#export_text').html(exportHtml)
      MicroModal.show('modal-export')
    })
  })
}
// https://developers.google.com/google-apps/calendar/quickstart/js
/**
 *  On load, called to load the auth2 library and API client library.
 */
/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient () {
  gapi.auth2.init({
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    clientId: CLIENT_ID,
    apiKey: API_KEY,
    scope: SCOPES
  })
    .then(function (a) {
      // Listen for sign-in state changes.
      // gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      // Handle the initial sign-in state.
      if (a && !a.error) {
        gapi.client.load('calendar', 'v3', () => {
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
        })
      }
    }, function (error) {
      console.log(error)
    }).catch(function (e) {
      console.log(e)
    })
  console.log('attaching')
  attachSignin()
}

function attachSignin () {
  console.log(gapi.auth2.getAuthInstance().isSignedIn.get())
  updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
  const element = document.getElementById('customGoogleBtn')
  gapi.auth2.getAuthInstance().attachClickHandler(element, {},
    function (googleUser) {
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
    }, function (error) {
      console.log(JSON.stringify(error, undefined, 2))
    })
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus (isSignedIn) {
  // Go from "loading gapis -> authorize"
  const notAuthorizedDiv = document.getElementById('notAuthorized')
  const isAuthorizedDiv = document.getElementById('isAuthorized')
  if (isSignedIn) {
    notAuthorizedDiv.style.display = 'none'
    isAuthorizedDiv.style.display = 'block'
    // Set global authorized so know (so that user doesn't have to sign in unless exporting)
    authorized = true
  } else {
    /* wait for getReadyForExport so not too many buttons
           notAuthorizedDiv.style.display = 'block';
         */
    notAuthorizedDiv.style.display = 'block'
    isAuthorizedDiv.style.display = 'none'
    authorized = false
  }
}
/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn()
}
/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut()
}
// Start from onLoad
function handleClientLoad () {
  // https://github.com/google/google-api-javascript-client/issues/265
  gapi.load('auth2', function () {
    initClient()
  })
}

function toggleCal() {
  $('#calContainer').slideToggle('slow', function () {
    setTimeout(function () {
      $('#calendar').fullCalendar('rerenderEvents')
    }, 200)
  })
}

function flashWhite() {
  document.body.classList.add('flashWhite')
  setTimeout(function () {
    document.body.classList.remove('flashWhite')
  }, 700)
}

function clearAll() {
  console.log('Clearing all')
  // Check all the boxes for these items w/in the hacker list (and, while
  // we're there, `select' these classes)

  // The id value of the hackerList is a string so to make .indexOf work,
  // convert selectedClasses to a string
  const strSelectedClasses = []
  for (const i in selectedClasses) {
    strSelectedClasses.push(selectedClasses[i].toString())
  }
  for (const item in hackerList.items) {
    if (strSelectedClasses.indexOf(hackerList.items[item].values().id) !== -1) {
      // Check the checkbox for this list item, doesn't call the callback
      // because, for now, nothing is shown (just startup)
      console.log('Clearing an elem')
      hackerList.items[item].elm.children[0].children[0].children[0].checked = false
      hackerList.items[item].elm.classList.remove('trHigh')
      // TODO don't update hash values for these bc wasteful
      // TODO don't update rightcol, do it afterward
      selectClass(parseInt(hackerList.items[item].values().id), true)
    }
  }
  selectedClasses = []
  reloadRightCol()
  updateHashCookie()
  // TODO generateDayTimeRanges();
}

function debounce(func, wait, immediate) {
  let timeout
  return function () {
    const context = this
    const args = arguments
    const later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
};

function generateDayTimeRanges() {
  // aray with 5 buckets (M-F), with range of times CAN NOT do
  // Want empty start because makes 1 off incides much cleaner
  // daysTimesRanges = [[], [], [], [], [], [], [], []];
  for (let j = 0; j < 2; j++) {
    for (const i in allAddedClassObj[j]) {
      const dow = JSON.parse(allAddedClassObj[j][i].dow)
      const startEnd = [parseInt(allAddedClassObj[0][i].start.replace(':', '')), parseInt(allAddedClassObj[0][i].end.replace(':', ''))]
      for (const d in dow) {
        daysTimesRanges[dow[d]].push(startEnd)
      }
    }
  }
}

function doesFit(item) {
  if (item.values().dow == null || item.values().start == null || item.values().end == null) {
    return false
  }
  let dow, start, end
  try {
    dow = JSON.parse(item.values().dow)
    start = parseInt(item.values().start.replace(':', ''))
    end = parseInt(item.values().end.replace(':', ''))
  } catch (e) {
    console.log('ERROR IN DOES FIT: ' + e)
    return false
  }
  for (const dowIndex in dow) {
    const d = dow[dowIndex]
    for (const r in daysTimesRanges[d]) {
      if (start >= daysTimesRanges[d][r][0] && end <= daysTimesRanges[d][r][1]) {
        return false
      }
    }
  }
  return true
}
