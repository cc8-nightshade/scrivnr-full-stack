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
      console.log(userInfo[0].contacts)
      return userInfo
    })
    .then((userInfo) => {
      console.log('useeeee', userInfo);
      console.log('eeeee', userInfo[0].contacts);
      let obj = userInfo[0].contacts;
      const values = Object.values(obj)
      console.log('values:', values) // [28, 17, 54] 
      // let b = JSON.stringify(obj)
      // let c = JSON.parse(b)
      // console.log(c)
      // console.log(obj[1].email)
      let arr = [];
      // for (let contact of c){
      //   console.log('HELLO', contact)
      //   arr.push(contact.email)
      // }
      values.forEach(contact => {
        console.log('HEY')
        arr.push(contact)
      })
     console.log(arr)
      dispatch({ type: "GET_USERINFO", arr }
      );

    })
    .catch((err) => {
      dispatch({ type: "GET_USERINFO_ERROR", err})
    })

  };
};



// { getFirebase, getFirestore}