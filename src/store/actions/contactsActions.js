
export const createContact = (contact) => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()
    firestore.collection('contacts').add({
      ...contact,
      // firstName: contact.firstName,
      // lastName: contact.lastName,
      // number: contact.number,
      createdAt: new Date()
    }).then(() => 
    {
      console.log('dispatch called')
      dispatch({ type: "CREATE_CONTACT", contact }
      );
    }).catch((err) => {
      dispatch({ type: "CREATE_CONTACT_ERROR", err})
    })

  };
};

// export const addToContacts = (searchedEmail, currentUserUid) => {
//   return (dispatch, getState, { getFirestore }) => {
//     const firestore = getFirestore()
//     console.log('contacts action called')
//     firestore.collection('users').doc(currentUserUid).update({
//       contacts: searchedEmail
//     }).then(() => 
//     {
//       console.log('dispatch called')
//       dispatch({ type: "ADD_CONTACT" }
//       );
//     }).catch((err) => {
//       dispatch({ type: "ADD_CONTACT_ERROR", err})
//     })

//   };
// };


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
    firestore.collection('users').where('uid', '==', userID).get().then(querySnapshot => {
      let userInfo = []
      querySnapshot.forEach(doc => {
        userInfo.push(doc.data())
      });
      const contactArray = userInfo[0].contacts;
      return contactArray
    })
    .then((contactArray) => {
      console.log(contactArray)
      console.log(searchedEmail)
      contactArray.push(searchedEmail[0])
      console.log('contacts action called')
      firestore.collection('users').doc(currentUserUid).update({
      contacts: contactArray
      // firstName: contact.firstName,
      // lastName: contact.lastName,
      // number: contact.number,
      })
    })
    .then(() => 
    {
      console.log('dispatch called')
      dispatch({ type: "ADD_CONTACT" }
      );
    }).catch((err) => {
      dispatch({ type: "ADD_CONTACT_ERROR", err})
    })

  };
};