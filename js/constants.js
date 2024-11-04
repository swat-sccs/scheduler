// TODO REDO EVERY SEMESTER SO GOOGLE CALENDAR ONLY CLEARS OUT MOST RECENT
// helps gCal disambiguate each semester's events so can delete only the newest semeter if change schedule
const term = 'spring25'
const termSubtitle = 'Spring 2025' // used as text for #semester-subtitle in index.html

// Tricoschedule may not be updated when the schedule first comes out
// If this is the case, use the xls scraped
const scheduleJSON = 'trico_scraped.json'
// const scheduleJSON = 'js/xls_scraped.json'

// Go to https://www.swarthmore.edu/registrar/five-year-calendar and fill in
const startSemester = ['2025', '01', '19'];
const endHalfSemester = ['2025', '03', '08'];
const endSemester = ['2025', '05', '10'];

// RRULE generator says use 50000Z so...I'm not Google go look it up
const endSemesterISO = endSemester[0] + endSemester[1] + endSemester[2]
const endHalfSemesterISO = endHalfSemester[0] + endHalfSemester[1] + endHalfSemester[2]

export {term, termSubtitle, scheduleJSON, startSemester, endSemester, endHalfSemester, endSemesterISO, endHalfSemesterISO}
