function makeTest(id) {
  const event = {
    calendarId: id,
    resource: {
      summary: 'Google I/O 2015',
      location: '800 Howard St., San Francisco, CA 94103',
      description: 'A chance to hear more about Google\'s developer products.',
      start: {
        dateTime: '2017-01-13T21:21:11',
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: '2017-01-13T21:21:11',
        timeZone: 'America/New_York'
      },
      extendedProperties: {
        private: {
          sccsTerm: term
        }
      }
    }
  }
  const makeTestReq = gapi.client.calendar.events.insert(event)
  console.log('make test ')
  makeTestReq.execute(function (resp) {
    console.log(resp)
  })
}