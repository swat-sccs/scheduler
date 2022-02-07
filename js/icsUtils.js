import * as ics from 'ics'                        // ics file builder
import * as fileDownload from 'js-file-download'; // JS file downloader

// Events array starts empty
let events = []

export function buildEvent(name, start, end, days, classEnd) {
  // Create event for referenced class
  const event = {
    title: name,
    busyStatus: 'BUSY',
    start: start.map(numStr => parseInt(numStr)), // Format: [yyyy, mm, dd, hh, mm]
    end: end.map(numStr => parseInt(numStr)),
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=' + String(days) // Format: SU,MO,TU,WE,TH,FR,SA
                    + ';INTERVAL=1;UNTIL=' + String(classEnd) // Format: yyyymmddT$timeutc
                    // https://www.textmagic.com/free-tools/rrule-generator
  }

  // Add to events cache
  events.push(event);
}

// Build ics file from array of ics-formatted events
export function buildFile() {
  // Create file, log and break gracefully on error
  ics.createEvents(events, (error, value) => {
    if (error) {
      console.log("Failed building file!")
      console.log(error)
      events = []
      return
    }

    // Try to download file, log and break gracefully on error
    try {
      fileDownload(value, `event.ics`);
    }
    catch {
      console.log("Failed downloading file!")
    }

    // Clear events cache
    events = [];
  })
}
