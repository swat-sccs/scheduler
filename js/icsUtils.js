const { writeFileSync } = require('fs')
const ics = require('ics')

export function buildEvent(name, start, end, days, classEnd) {
  const event = {
    title: name,
    busyStatus: 'BUSY',
    start: [parseInt(start[0]), parseInt(start[1]), parseInt(start[2]), 
            parseInt(start[3]), parseInt(start[4])], // Format: [yyyy, mm, dd, hh, mm]
    end: [parseInt(end[0]), parseInt(end[1]), parseInt(end[2]), 
          parseInt(end[3]), parseInt(end[4])],
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=' + days // Format: SU,MO,TU,WE,TH,FR,SA
                    + ';INTERVAL=1;UNTIL=' + classEnd // Format: yyyymmddT$timeutc
                    // https://www.textmagic.com/free-tools/rrule-generator
  }
  return event;
}

export function buildFile() {
  ics.createEvents(events, (error, value) => {
    if (error) {
      console.log(error)
    }

    fileDownload(value, `event.ics`);
  })
}
