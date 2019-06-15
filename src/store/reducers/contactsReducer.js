const intitialState = {
  contactArray: ''
}


const contactsReducer = (state = intitialState, action) => {
  switch(action.type){
    case 'CREATE_CONTACT':
      return state
    case 'GET_CONTACTS':
      state.contactArray = action.contactArray
      return state
  }
  return state
}

export default contactsReducer