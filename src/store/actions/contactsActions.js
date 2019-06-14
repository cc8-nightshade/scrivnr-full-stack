
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