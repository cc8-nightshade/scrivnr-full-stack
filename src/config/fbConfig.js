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

let minConfig = {
  apiKey:'AIzaSyD_V51BMgZu__1LQXiS8-OJt3YTcR6MxAE',
  authDomain: "nightshadetest-d5d00.firebaseapp.com",
  databaseURL: "https://nightshadetest-d5d00.firebaseio.com",
  projectId: "nightshadetest-d5d00",
  storageBucket: "nightshadetest-d5d00.appspot.com",
  messagingSenderId: "571666246376",
  appId: "1:571666246376:web:67c123f75ac06c17"
}

// Initialize Firebase
firebase.initializeApp(fbConfig);
// firebase.firestore().settings({ timestampsInSnapshots: true })

export default firebase