// TODO REDO EVERY SEMESTER SO GOOGLE CALENDAR ONLY CLEARS OUT MOST RECENT
// helps gCal disambiguate each semester's events so can delete only the newest semeter if change schedule
const term = 'spring23'
const termSubtitle = 'Spring 2023' // used as text for #semester-subtitle in index.html

// Tricoschedule may not be updated when the schedule first comes out
// If this is the case, use the xls scraped
const scheduleJSON = 'trico_scraped.json'
// const scheduleJSON = 'js/xls_scraped.json'

// Go to https://www.swarthmore.edu/registrar/five-year-calendar and fill in
// month number are 0 indexed! so -1
// test in javascript console by doing `new Date(... below ...)`
const startSemesterTime = Date.UTC(2023, 0, 17, 0, 0, 0)

// Change these lol I don't wanna write a scraper rn
const startSemester = ['2023', '01', '17'];
const endSemester = ['2023', '04', '28'];
const endHalfSemester = ['2022', '03', '03'];

// RRULE generator says use 50000Z so...I'm not Google go look it up
const endSemesterISO = endSemester[0] + endSemester[1] + endSemester[2]// + (term.includes('fall') ? 'T050000Z' : 'T040000Z')
const endHalfSemesterISO = endHalfSemester[0] + endHalfSemester[1] + endHalfSemester[2]// +  (term.includes('fall') ? 'T040000Z' : 'T050000Z')

export {term, termSubtitle, scheduleJSON, startSemesterTime, startSemester, endSemester, endHalfSemester, endSemesterISO, endHalfSemesterISO}
