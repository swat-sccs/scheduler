const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']
const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function dateToString(d) {
  return days[d.getUTCDay()] + ' ' + months[d.getUTCMonth()] + ' ' + d.getUTCDate() + ' ' + d.getUTCFullYear()
}

function addDay(date, days) {
  const dat = new Date(date.getTime())
  dat.setDate(dat.getDate() + days)
  return dat
}

function twoDigits(value) {
  return (value < 10 ? '0' : '') + value
}

function totruncateISOString(date) {
  return date.getUTCFullYear() + '-' + twoDigits(date.getUTCMonth() + 1) + '-' + twoDigits(date.getUTCDate())
}

function toDateStr(date) {
  return date.getUTCFullYear() + twoDigits(date.getUTCMonth() + 1) + twoDigits(date.getUTCDate())
}

export {dateToString, addDay, twoDigits, totruncateISOString, toDateStr}