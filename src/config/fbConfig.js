import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

// require('dotenv').config()
      // Your web app's Firebase configuration
var fbConfig = {
  apiKey:'AIzaSyBkO2Id9fChJLJEIoDncFQIZkveN1p4O6M',
  authDomain: "scrivnr-8564b.firebaseapp.com",
  databaseURL: "https://scrivnr-8564b.firebaseio.com",
  projectId: "scrivnr-8564b",
  storageBucket: "scrivnr-8564b.appspot.com",
  messagingSenderId: "965017963607",
  appId: "1:965017963607:web:f4a5340fb6997601"
};
// Initialize Firebase
firebase.initializeApp(fbConfig);
// firebase.firestore().settings({ timestampsInSnapshots: true })

export default firebase