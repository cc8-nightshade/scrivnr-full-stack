import { combineReducers } from 'redux'
import authReducer from './authReducer'
import contactsReducer from './contactsReducer'
import transcriptsReducer from './transcriptsReducer';
import usersReducer from './usersReducer'
import videoReducer from './videoReducer';
import { firebaseReducer } from 'react-redux-firebase'
import { firestoreReducer } from 'redux-firestore'

const rootReducer = combineReducers({
  contacts: contactsReducer,
  transcripts: transcriptsReducer,
  auth: authReducer,
  users: usersReducer,
  video: videoReducer,
  firebase: firebaseReducer,
  firestore: firestoreReducer
})

export default rootReducer