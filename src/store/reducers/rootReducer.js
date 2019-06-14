import { combineReducers } from 'redux'
import authReducer from './authReducer'
import usersReducer from './usersReducer'
import videoReducer from './videoReducer';
import { firebaseReducer } from 'react-redux-firebase'
import { firestoreReducer } from 'redux-firestore'
import contactsReducer from './contactsReducer';

const rootReducer = combineReducers({
  contacts: contactsReducer,
  auth: authReducer,
  users: usersReducer,
  video: videoReducer,
  firebase: firebaseReducer,
  firestore: firestoreReducer
})

export default rootReducer