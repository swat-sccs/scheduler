const { writeFileSync } = require('fs')
const ics = require('ics')

function buildEvent(name, room, start, duration, days, classEnd) {
    ics.createEvent({
        title: name,
        description: room,
        busyStatus: 'FREE',
        start: start, // Format: [yyyy, mm, dd, hh, mm]
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=' + days // Format: SU,MO,TU,WE,TH,FR,SA
                        + ';INTERVAL=1;UNTIL=' + classEnd // Format: yyyymmdd
                        + 'T050000Z',
                        // https://www.textmagic.com/free-tools/rrule-generator
        duration: { minutes: 50 }
      }, (error, value) => {
        if (error) {
          console.log(error)
        }
      
        writeFileSync(`${__dirname}/event.ics`, value)
      })
}