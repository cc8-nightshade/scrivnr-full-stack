const intitialState = {
  contacts: ''
}


const contactsReducer = (state = intitialState, action) => {
  switch(action.type){
    case 'CREATE_CONTACT':
      console.log('yolo', action.contact)
      return state
    case 'GET_CONTACTS':
      console.log('get reducer called', action.contactArray)
      state.contacts = action.contactArray
      return state
  }
  return state
}

export default contactsReducer