export const getUsers = () => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore();
    const profile = getState().firebase.profile;
    // onSnapshot - try to implement for auto-updating
    firestore
      .collection("users")
      .get()
      .then(querySnapshot => {
        let userArray = [];
        querySnapshot.forEach(doc => {
          userArray.push(doc.data());
        });
        dispatch({ type: "GET_USERS", userArray });
      })
      .catch(err => {
        dispatch({ type: "GET_USERS_ERROR", err });
      });
  };
};

export const getOnlineUsers = onlineNow => {
  return (dispatch, getState) => {
    dispatch({ type: "ONLINE_USERS", onlineNow });
  };
};

export const searchUsers = input => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore();
    // onSnapshot - try to implement for auto-updating
    let searchedEmail = [];
    if (input.searchedEmail) {
      firestore
        .collection("users")
        .where("email", "==", input.searchedEmail)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            searchedEmail.push(doc.data());
          });
          if (searchedEmail.length < 1) {
            alert("User does not exist");
            return;
          }
          if (searchedEmail.length == 1) {
            dispatch({ type: "SEARCH_USERS", searchedEmail });
          }
        })
        .catch(err => {
          dispatch({ type: "SEARCH_USERS_ERROR", err });
        });
    } else {
      alert("User does not exist");
    }
  };
};

export const getUserInfoByCurrentUser = () => {
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
        dispatch({ type: "GET_USERINFO", userInfo });
      })
      .catch(err => {
        dispatch({ type: "GET_USERINFO_ERROR", err });
      });
  };
};

// { getFirebase, getFirestore}
