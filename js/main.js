import '../css/normalize.css'
import '../css/main.css'

import $ from 'jquery'
import Cookies from 'js-cookie'
import MicroModal from 'micromodal'
import List from 'list.js'
import {Calendar} from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'

import {term, termSubtitle, scheduleJSON} from './constants'
import {handleClientLoad, handleSignoutClick, isAuthorized} from './googleClient'
import {exportToGoogle} from './googleCalendar'


let selectedClasses = []
let classSchedObj
// Needs to be global so can i.e. search from the window location hash
let hackerList
let fullCalendar
// Needs to be global so hacker list can tell when classes do not fit
// TODO too long?
const daysTimesRanges = [[], [], [], [], [], [], [], []]
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

let maximumStartTime = '09:00:00'
let minimumEndTime = '16:00:00'

function initCalendar() {
  // page is now ready, initialize the calendar...
  const calendarElement = document.getElementById('calendar')
  fullCalendar = new Calendar(calendarElement, {
    height: 'auto',
    plugins: [timeGridPlugin],
    slotMinTime: maximumStartTime,
    slotMaxTime: minimumEndTime,
    weekends: false,
    allDaySlot: false,
    headerToolbar: false,
    dayHeaderFormat: {weekday: 'long'},
    initialView: 'timeGridWeek',
    editable: false,
    eventColor: normalEventColor,
    eventContent: function(arg) {
      const props = arg.event.extendedProps
      // need the split since multitime objects have both times in props.time, making everything ugly
      const time = props.time.split('<br>')[0].replaceAll('am', '').replaceAll('pm', '').replace('-', '- ')
      return {html: '<div class="fc-event-main-frame"><div class="fc-event-time">' + time +
        '</div><div class="fc-event-title-container"><div class="fc-event-title fc-sticky"><b>' + props.subj +
        ' ' + props.numSec + '</b>: ' + props.c_title + "</div></div></div>"}
    }
  })
  fullCalendar.render()
}

function updateSlotTimes() {
  const events = fullCalendar.getEvents()
  let minTime = maximumStartTime
  let maxTime = minimumEndTime
  for (const i in events) {
    // Can use string comparison to compare because is 24 hour time
    const evnt = events[i]
    const start = evnt.start.toTimeString().split(' ')[0]
    const end = evnt.end.toTimeString().split(' ')[0]
    if (start < minTime) {
      minTime = start
    }
    if (end > maxTime) {
      maxTime = end
    }
  }
  fullCalendar.setOption('slotMinTime', minTime)
  fullCalendar.setOption('slotMaxTime', maxTime)
}

function selectClass(id, bulk) {
  // If bulk, don't save to cookie/hash so don't hammer in initial load
  // this will contain a reference to the checkbox

  // Selected a new class
  if (selectedClasses.indexOf(id) === -1) {
    const thisClass = classSchedObj[0][id]
    // in classSchedObj[0] so not in classSchedObj[1] so has a time
    if (thisClass != null) {
      let newEvent = {...thisClass}
      newEvent.daysOfWeek = thisClass.dow
      newEvent.startTime = thisClass.start
      newEvent.endTime = thisClass.end
      let source = {id: id, events: [newEvent]}
      if (thisClass.multiTime != null) {
        let multiEvent = {...thisClass.multiTime}
        multiEvent.daysOfWeek = thisClass.multiTime.dow
        multiEvent.startTime = thisClass.multiTime.start
        multiEvent.endTime = thisClass.multiTime.end
        source.events.push(multiEvent)
      }
      fullCalendar.addEventSource(source)
      updateSlotTimes()
    }

    selectedClasses.push(id)
  } else {
    // selected an old class (if multitime, will delete both TODO)
    const thisClass = classSchedObj[0][id]
    // in classSchedObj[0] so not in classSchedObj[1] so has a time
    if (thisClass != null) {
      fullCalendar.getEventSourceById(id).remove()
      thisClass.highlighted = false
      updateSlotTimes()
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
      hackerList.items[item].elm.children[0].children[0].children[0].checked = true
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

function setupEventListeners() {
  document.getElementById('export-button').addEventListener('click', getReadyForExport)
  document.getElementById('signout-button').addEventListener('click', handleSignoutClick)
  document.getElementById('toggleCal').addEventListener('click', toggleCal)
}

// would like this script to be in the html directly but the onload is tricky
// due to module, the functions aren't global and can't be called from the html directly
function setGoogleScript() {
  const googleAPI = document.createElement('script')
  googleAPI.setAttribute('src', 'https://apis.google.com/js/api:client.js')
  googleAPI.onload = handleClientLoad
  document.body.appendChild(googleAPI)
}

function highlightClass(id, bulk) {
  // if bulk, don't change cookie/hash (from beginning)
  let thisClass = classSchedObj[0][id]
  if (thisClass != null) {
    // we'd love to use event.setProp but it doesn't seem to rerender so we remove event and add it back w/ right colors
    fullCalendar.getEventSourceById(id).remove()
    let source = {id: id, events: []}
    let newEvent = {...thisClass}
    newEvent.daysOfWeek = thisClass.dow
    newEvent.startTime = thisClass.start
    newEvent.endTime = thisClass.end
    source.events.push(newEvent)
    if (thisClass.multiTime != null) {
      let multiEvent = {...thisClass.multiTime}
      multiEvent.daysOfWeek = thisClass.multiTime.dow
      multiEvent.startTime = thisClass.multiTime.start
      multiEvent.endTime = thisClass.multiTime.end
      source.events.push(multiEvent)
    }
    if (!thisClass.highlighted) {
      source.backgroundColor = highlightEventColor
      source.borderColor = highlightEventColor
      source.textColor = '#222'
    } else {
      source.backgroundColor = normalEventColor
    }

    fullCalendar.addEventSource(source)
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
  $('.icon-brush').on("click", highlightCallback)
  $('.icon-trash-1').on("click", trashCallback)
}

function getReadyForExport() {
  // Show either log out or authorize
  if (isAuthorized) {
    // Already authorized, can go right in
    exportToGoogle(classSchedObj, selectedClasses)
  }
}

function toggleCal() {
  $('#calContainer').slideToggle('slow', function () {
    setTimeout(function () {
      fullCalendar.render()
    }, 200)
  })
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

function generateDayTimeRanges() {
  // aray with 5 buckets (M-F), with range of times CAN NOT do
  // Want empty start because makes 1 off incides much cleaner
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

initCalendar()
MicroModal.init()
setGoogleScript()
setupEventListeners()
document.getElementById('semester-subtitle').textContent = termSubtitle

$.getJSON(scheduleJSON, function(data) {
  // classSchedObj from included schedule.js file (made with `doAll` in folder)
  // classSchedObj = [hasTimes, hasNoTimes, multipleTimes]
  classSchedObj = data
  const tableArr = []

  // Do normal hasTimes and hasNoTimes. multipleTimes is checked when added to see if exists
  for (let i = 0; i <= 1; i++) {
    for (const z in classSchedObj[i]) {
      const id = classSchedObj[i][z].id
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
