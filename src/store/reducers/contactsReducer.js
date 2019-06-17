const intitialState = {
  contactArray: '',
  filteredArray:[{uid:2}]
}


const contactsReducer = (state = intitialState, action) => {
  switch(action.type){
    case 'ADD_CONTACT':
      console.log('add contact reducer called ')
      return state
    case 'DELETE_CONTACT':
      console.log('delete called', action.filteredArray)
      state.filteredArray = action.filteredArray
      return state
    case 'GET_CONTACTS':
      state.contactArray = action.contactArray
      return state
    default:
      return state
  }
}

export default contactsReducer