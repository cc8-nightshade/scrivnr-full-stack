const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");
require('dotenv').config()

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey:'AIzaSyBkO2Id9fChJLJEIoDncFQIZkveN1p4O6M',
    authDomain: "scrivnr-8564b.firebaseapp.com",
    databaseURL: "https://scrivnr-8564b.firebaseio.com",
    projectId: "scrivnr-8564b",
    storageBucket: "scrivnr-8564b.appspot.com",
    messagingSenderId: "965017963607",
    appId: "1:965017963607:web:f4a5340fb6997601"
    // apiKey: process.env.API_KEY,
    // authDomain: process.env.AUTO_DOMAIN,
    // databaseURL: process.env.DATABASE_URL,
    // projectId: process.env.PROJECT_ID,
    // storageBucket: process.env.STORAGE_BUCKET,
    // messagingSenderId: process.env.MESSAGING_SENDER_ID,
    // appId: process.env.API_ID
  });
}

module.exports = { firebase };