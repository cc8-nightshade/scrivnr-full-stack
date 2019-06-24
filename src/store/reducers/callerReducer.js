const intitialState = {
  status: 'notInCall'
}


const callerReducer = (state = intitialState, action) => {
  switch(action.type){
    case 'CALLING_SUCCESS':
      state.status = action.status
      console.log('status reducer called ')
      return state
    case 'CALLING_ERROR':   
      return state
    case 'STATUS_SUCCESS':
      console.log('status reducer called ')
      return state
    case 'STATUS_ERROR':   
      return state
    default:
      return state
  }
}

export default callerReducer
