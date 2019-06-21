export const getContactsByCurrentUser = () => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore();
    const userID = getState().firebase.auth.uid; // later for mapping userid to contacts
    // onSnapshot - try to implement for auto-updating
    firestore
      .collection("users")
      .where("uid", "==", userID)
      .get()
      .then(querySnapshot => {
        let userInfo = [];
        querySnapshot.forEach(doc => {
          userInfo.push(doc.data());
        });
        const contactArray = userInfo[0].contacts;
        dispatch({ type: "GET_CONTACTS", contactArray });
      })
      .catch(err => {
        dispatch({ type: "GET_CONTACTS_ERROR", err });
      });
  };
};

export const addToContacts = (searchedEmail, currentUserUid) => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore();
    const userID = getState().firebase.auth.uid; // later for mapping userid to contacts
    // onSnapshot - try to implement for auto-updating
    Promise.all([
      firestore
        .collection("users")
        .where("uid", "==", userID)
        .get(),
      firestore
        .collection("users")
        .where("uid", "==", searchedEmail[0].uid)
        .get()
    ]).then(profiles => {
      const profilesArray = [];
      profiles.forEach(profile => {
        profile.forEach(querySnapshot => {
          const data = querySnapshot.data();
          profilesArray.push(data);
        });
      });
      const hasContact = profilesArray[1].contacts.filter(contact => {
        return contact.uid === profilesArray[0].uid;
      });
      const hasContactTwo = profilesArray[0].contacts.filter(contact => {
        return contact.uid === profilesArray[1].uid;
      });

      if (hasContact.length === 0) {
        let removedContact = { ...profilesArray[0] };
        delete removedContact["contacts"];
        profilesArray[1].contacts.push(removedContact);
      }
      if (hasContactTwo.length === 0) {
        let removedContact = { ...profilesArray[1] };
        delete removedContact["contacts"];
        profilesArray[0].contacts.push(removedContact);
      }

      // console.log(profilesArray);

      profilesArray.forEach(profile => {
        firestore
          .collection("users")
          .doc(profile.uid)
          .update({
            contacts: profile.contacts
          });
      });
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
    const firestore = getFirestore();
    const userID = getState().firebase.auth.uid; // later for mapping userid to contacts
    console.log(userID, searchedEmail);
    Promise.all([
      firestore
        .collection("users")
        .where("uid", "==", userID)
        .get(),
      firestore
        .collection("users")
        .where("uid", "==", searchedEmail.uid)
        .get()
    ])
    .then(profiles => {
      const profilesArray = [];
      profiles.forEach(profile => {
        profile.forEach(querySnapshot => {
          const data = querySnapshot.data();
          profilesArray.push(data);
        });
      })

      
        const currentFilteredContects = profilesArray[0].contacts.filter(item => {return item.uid !== searchedEmail.uid})
        firestore
          .collection("users")
          .doc(userID)
          .update({
            contacts: currentFilteredContects
          })
      
        const oponentFilteredContects = profilesArray[1].contacts.filter(item => {return item.uid !== userID})
        firestore
          .collection("users")
          .doc(searchedEmail.uid)
          .update({
            contacts: oponentFilteredContects
          })
        
        dispatch({ type: "DELETE_CONTACT", currentFilteredContects });
    })
    .catch(err => {
      dispatch({ type: "DELETE_CONTACT_ERROR", err });
    });
  };
};
