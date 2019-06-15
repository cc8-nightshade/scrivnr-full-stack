export const signIn = (credentials) => {
  return (dispatch, getState, { getFirebase }) => {
    const firebase = getFirebase()
    firebase.auth().signInWithEmailAndPassword(
      credentials.email, 
      credentials.password)  
    .then(() => 
    {
      dispatch({ type: "LOGIN_SUCCESS" }
      );
    }).catch((err) => {
      dispatch({ type: "LOGIN_ERROR", err})
    })

  };
};

export const signOut = () => {
  return (dispatch, getState, { getFirebase }) => {
    const firebase = getFirebase()
    firebase.auth().signOut()  
    .then(() => 
    {
      dispatch({ type: "SIGN_OUT_SUCCESS" }
      );
    }).catch((err) => {
      dispatch({ type: "SIGN_OUT_ERROR", err})
    })

  };
};

export const signUp = (credentials) => {
  return (dispatch, getState, { getFirestore , getFirebase }) => {
    const firestore = getFirestore()
    const firebase = getFirebase()
    firebase.auth().createUserWithEmailAndPassword(
      credentials.email, 
      credentials.password)
      .then((cred) => {
        // auth.currentUser.updateProfile({
        //     displayName: username
        // })
        return firestore.collection('users').doc(cred.user.uid).set({
          uid: cred.user.uid,
          userName: credentials.userName,
          email: cred.user.email
        })
      })
    .then(() => 
    {
      dispatch({ type: "SIGNUP_SUCCESS" }
      );
    }).catch((err) => {
      dispatch({ type: "SIGNUP_ERROR", err})
    })

  };
};