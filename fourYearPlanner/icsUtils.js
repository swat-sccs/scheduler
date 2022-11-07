import * as ics from 'ics'                        // ics file builder
import * as fileDownload from 'js-file-download'; // JS file downloader

import { strNumericAdd } from './helpers'

// Events array starts empty
let events = []

/**
 * Builds ics-formatted event and stores in array
 * @param name Title of event
 * @param start Start date array
 * @param end End date array
 * @param days Days of week string
 * @param classEnd ISO-formatted end date string
*/
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

/**
 * Build and download ics file from array of ics-formatted events
*/
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

/**
 * Fixes start date arrays to properly represent starting dates of recurring events
 * @param days Days of week string
 * @param start Starting date array
 * @param end Ending date array
 * @param array Array to reference for relative dates
*/
export function fixDates(days, start, end, array) {
  switch(days.substring(0,2)) {
    case 'TU':
      start[2] = strNumericAdd(array[2], "1")
      end[2] = start[2];
      break;
    case 'WE':
      start[2] = strNumericAdd(array[2], "2")
      end[2] = start[2];
      break;
    case 'TH':
      start[2] = strNumericAdd(array[2], "3")
      end[2] = start[2];
      break;
    case 'FR':
      start[2] = strNumericAdd(array[2], "4")
      end[2] = start[2];
      break;
  }
}
