const { writeFileSync } = require('fs')
const ics = require('ics')

export function buildEvent(name, start, end, days, classEnd) {
  const event = {
    title: name,
    busyStatus: 'BUSY',
    start: start, // Format: [yyyy, mm, dd, hh, mm]
    end: end,
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=' + days // Format: SU,MO,TU,WE,TH,FR,SA
                    + ';INTERVAL=1;UNTIL=' + classEnd // Format: yyyymmdd
                    + 'T050000Z',
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
