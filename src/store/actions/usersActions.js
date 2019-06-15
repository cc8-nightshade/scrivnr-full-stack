export const getUsers = () => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()
    const profile = getState().firebase.profile
    const userID = getState().firebase.auth.uid // later for mapping userid to contacts
    // onSnapshot - try to implement for auto-updating
    firestore.collection('users').get().then(querySnapshot => {
      let userArray = []
      querySnapshot.forEach(doc => {
        userArray.push(doc.data())
      });
      dispatch({ type: "GET_USERS", userArray }
      );
    })
    .catch((err) => {
      dispatch({ type: "GET_USERS_ERROR", err})
    })

  };
};

export const getUserInfoByCurrentUser = () => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()
    const profile = getState().firebase.profile
    const userID = getState().firebase.auth.uid // later for mapping userid to contacts
    // onSnapshot - try to implement for auto-updating
    firestore.collection('users').where('uid', '==', userID).get().then(querySnapshot => {
      let userInfo = []
      querySnapshot.forEach(doc => {
        userInfo.push(doc.data())
      });     
      dispatch({ type: "GET_USERINFO", userInfo }
      );
    })  
    .catch((err) => {
      dispatch({ type: "GET_USERINFO_ERROR", err})
    })
  };
};



// { getFirebase, getFirestore}