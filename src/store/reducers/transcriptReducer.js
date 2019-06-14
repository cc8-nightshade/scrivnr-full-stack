const intitialState = {
  transcript: []
}


const transcriptReducer = (state = intitialState, action) => {
  switch(action.type){
    case 'GET_TRANSCRIPTS':
      console.log('get trans reducer called', action.transcriptArray)
      state.transcript = action.transcriptArray
      return state
  }
  return state
}

export default transcriptReducer