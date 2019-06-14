const intitialState = {
  contacts: ''
}


const contactsReducer = (state = intitialState, action) => {
  switch(action.type){
    case 'CREATE_CONTACT':
      return state
    case 'GET_CONTACTS':
      state.users = action.userArray
      return state
  }
  return state
}

export default contactsReducer