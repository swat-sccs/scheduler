// TODO REDO EVERY SEMESTER SO GOOGLE CALENDAR ONLY CLEARS OUT MOST RECENT
// helps gCal disambiguate each semester's events so can delete only the newest semeter if change schedule
const term = 'spring21'
const termSubtitle = 'Spring 2021' // used as text for #semester-subtitle in index.html

// Tricoschedule may not be updated when the schedule first comes out
// If this is the case, use the xls scraped
const scheduleJSON = 'js/trico_scraped.json'
// const scheduleJSON = 'js/xls_scraped.json'

// Go to https://www.swarthmore.edu/registrar/five-year-calendar and fill in
// month number are 0 indexed! so -1
// test in javascript console by doing `new Date(... below ...)`
const startSemesterTime = Date.UTC(2021, 7, 30, 0, 0, 0)

// Just change the part before "T" as normal, not 0 indexed
// Inclusive but needs to be at T235959Z so gets whole day when ends (can also be the next day (exclusive)T000000Z but that isn't ideal if have whole-day events)
// TODO known issue with timezones (Z is UTC) for late running events on the last day
const endSemesterISO = '20211218T235959Z'

export {term, termSubtitle, scheduleJSON, startSemesterTime, endSemesterISO}
