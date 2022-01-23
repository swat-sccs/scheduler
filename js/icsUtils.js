const { writeFileSync } = require('fs')
const ics = require('ics')

export function buildEvent(name, room, start, duration, days, classEnd) {
  const event = {
    title: name,
    description: room,
    busyStatus: 'FREE',
    start: start, // Format: [yyyy, mm, dd, hh, mm]
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=' + days // Format: SU,MO,TU,WE,TH,FR,SA
                    + ';INTERVAL=1;UNTIL=' + classEnd // Format: yyyymmdd
                    + 'T050000Z',
                    // https://www.textmagic.com/free-tools/rrule-generator
    duration: { minutes: 50 }
  }
  return event;
}

function buildFile(events) {
}
