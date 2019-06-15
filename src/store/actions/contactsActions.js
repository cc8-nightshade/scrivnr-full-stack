
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


export const getContactsByCurrentUser = () => {
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
      return userInfo
    })
    .then((userInfo) => {
      const obj = userInfo[0].contacts;
      const values = Object.values(obj)
      const contactArray = [];
      values.forEach(contact => {
        contactArray.push(contact)
      })
      dispatch({ type: "GET_CONTACTS", contactArray }
      );
    })
    .catch((err) => {
      dispatch({ type: "GET_CONTACTS_ERROR", err})
    })

  };
};