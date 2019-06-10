const intitialState = {
  contacts: [
    { id: 1,
      firstName: 'Min',
      lastName: 'Kim'
    },
    { id: 2,
      firstName: 'Ian',
      lastName: 'Cameron'
    },
    { id: 3,
      firstName: 'Konst',
      lastName: 'Varg'
    },
  ]
}


const contactsReducer = (state = intitialState, action) => {
  switch(action.type){
    case 'CREATE_CONTACT':
      console.log('yolo', action.contact)
      return state
  }
  return state
}

export default contactsReducer