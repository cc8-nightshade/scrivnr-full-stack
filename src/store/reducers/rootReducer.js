import { combineReducers } from 'redux'
import authReducer from './authReducer'
import contactsReducer from './contactsReducer'
import transcriptReducer from './transcriptReducer';
import videoReducer from './videoReducer';
import { firebaseReducer } from 'react-redux-firebase'
import { firestoreReducer } from 'redux-firestore'

const rootReducer = combineReducers({
  auth: authReducer,
  contacts: contactsReducer,
  transcripts: transcriptReducer,
  video: videoReducer,
  firebase: firebaseReducer,
  firestore: firestoreReducer
})

export default rootReducer