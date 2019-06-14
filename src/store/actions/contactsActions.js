export const createContact = (contact) => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()
    firestore.collection('contacts').add({
      firstName: contact.firstName,
      lastName: contact.lastName,
      number: contact.number,
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

export const getContacts = () => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()
    firestore.collection('contacts').get()
    .then(querySnapshot => {
      let contactArray = []
      querySnapshot.forEach(doc => {
        contactArray.push(doc.data())
      });
      dispatch({ type: "GET_CONTACTS", contactArray }
      );
    })
    .catch((err) => {
      dispatch({ type: "GET_CONTACTS_ERROR", err})
    })

  };
};

// { getFirebase, getFirestore}