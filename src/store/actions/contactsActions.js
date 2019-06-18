
export const getContactsByCurrentUser = () => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()
    const userID = getState().firebase.auth.uid // later for mapping userid to contacts
    // onSnapshot - try to implement for auto-updating
    firestore.collection('users').where('uid', '==', userID).get().then(querySnapshot => {
      let userInfo = []
      querySnapshot.forEach(doc => {
        userInfo.push(doc.data())
      });
      const contactArray = userInfo[0].contacts;
      dispatch({ type: "GET_CONTACTS", contactArray }
      );
    })
    .catch((err) => {
      dispatch({ type: "GET_CONTACTS_ERROR", err})
    })

  };
};

export const addToContacts = (searchedEmail, currentUserUid) => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()
    const userID = getState().firebase.auth.uid // later for mapping userid to contacts
    // onSnapshot - try to implement for auto-updating
    console.log(userID)
    firestore.collection('users').where('uid', '==', userID).get().then(querySnapshot => {
      let userInfo = []
      querySnapshot.forEach(doc => {
        console.log(doc.data())
        userInfo.push(doc.data())
      });
      const contactArray = userInfo[0].contacts;
      console.log('add action called', contactArray)
      return contactArray
    })
    .then((contactArray) => {
      contactArray.push(searchedEmail[0])
      firestore.collection('users').doc(currentUserUid).update({
      contacts: contactArray
      })
    })
    .then(() => 
    {
      dispatch({ type: "ADD_CONTACT" }
      );
    }).catch((err) => {
      dispatch({ type: "ADD_CONTACT_ERROR", err})
    })

  };
};

export const deleteContact = (searchedEmail, currentUserUid) => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()
    const userID = getState().firebase.auth.uid // later for mapping userid to contacts
    // onSnapshot - try to implement for auto-updating
    firestore.collection('users').where('uid', '==', userID).get().then(querySnapshot => {
      let userInfo = []
      querySnapshot.forEach(doc => {
        userInfo.push(doc.data())
      });
      const contactArray = userInfo[0].contacts;
      return contactArray
    })
    .then((contactArray) => {
      const filteredArray = contactArray.filter(contact => contact.email !== searchedEmail)
      firestore.collection('users').doc(currentUserUid).update({
      contacts: filteredArray
      })
      // return filteredArray
      console.log('delete dispatch called', filteredArray)
      dispatch({ type: "DELETE_CONTACT", filteredArray }
      );
    })
    // .then((filteredArray) => 
    // {
    // })
    .catch((err) => {
      dispatch({ type: "DELETE_CONTACT_ERROR", err})
    })

  };
};