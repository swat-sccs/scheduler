import MicroModal from 'micromodal'
import {dateToString, addDay, totruncateISOString} from './dateHelpers'
import {term, endSemesterISO, startSemesterTime} from './constants'

const quotes = ['The cure for boredom is curiosity. There is no cure for curiosity. \n -Ellen Parr', 'It always seems impossible until it is done\n - Nelson Mandela', 'Education is what survives when what has been learned has been forgotten.\n - BF Skinner', 'Everybody is a genius ... But, if you judge a fish by its ability to climb a tree, it will live its whole life believing it is stupid\n - Albert Einstein', 'No pressure, no diamonds\n - Thomas Carlyle', "One kind word can change someone's entire day", 'When nothing goes right ...  go left']

function randomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)]
}

/**
 * Ensure MicroModal.init() has been called before this function
 */
function exportToGoogle(classSchedObj, selectedClasses) {
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
    let startDate = new Date(startSemesterTime)
    let endDate = new Date(startSemesterTime)
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
      const startSemDate = new Date(startSemesterTime)

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
      document.getElementById('export_text').innerHTML = exportHtml
      MicroModal.show('modal-export')
    })
  })
}

export {exportToGoogle}
