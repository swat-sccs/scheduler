// https://developers.google.com/calendar/quickstart/js

const CLIENT_ID = '67188111758-2l0sr7lpabrkbpbc7nen9ktnk5u71oc3.apps.googleusercontent.com'
const API_KEY = '3q3gVoDEjU8KVeTKBAxAGnyF'
// Can't be readonly scope because needs to be able to create cals and change events
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly'

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.auth2.init({
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    clientId: CLIENT_ID,
    apiKey: API_KEY,
    scope: SCOPES
  }).then(function (a) {
    // Handle the initial sign-in state.
    if (a && !a.error) {
      gapi.client.load('calendar', 'v3', () => {
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
      })
    }
  }, function (error) {
    console.error(error)
  }).catch(function (e) {
    console.error(e)
  })
  console.log('attaching')
  attachSignin()
}
  
function attachSignin() {
  updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
  const element = document.getElementById('customGoogleBtn')
  gapi.auth2.getAuthInstance().attachClickHandler(element, {},
    function (googleUser) {
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
    }, function (error) {
      console.error(JSON.stringify(error, undefined, 2))
    }
  )
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
let isAuthorized = false
function updateSigninStatus(isSignedIn) {
  // Go from "loading gapis -> authorize"
  const notAuthorizedDiv = document.getElementById('notAuthorized')
  const isAuthorizedDiv = document.getElementById('isAuthorized')
  if (isSignedIn) {
    notAuthorizedDiv.style.display = 'none'
    isAuthorizedDiv.style.display = 'block'
    // Set global authorized so know (so that user doesn't have to sign in unless exporting)
    isAuthorized = true
  } else {
    // wait for getReadyForExport so not too many buttons
    notAuthorizedDiv.style.display = 'block'
    isAuthorizedDiv.style.display = 'none'
    isAuthorized = false
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn()
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut()
}

// Start from onLoad
function handleClientLoad() {
  // https://github.com/google/google-api-javascript-client/issues/265
  gapi.load('auth2', function () {
    initClient()
  })
}

export {handleClientLoad, handleSignoutClick, handleAuthClick, isAuthorized}