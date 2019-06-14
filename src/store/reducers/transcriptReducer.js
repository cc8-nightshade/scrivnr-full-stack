const intitialState = {
  transcript: []
}


const transcriptReducer = (state = intitialState, action) => {
  switch(action.type){
    case 'GET_TRANSCRIPTS':
      state.transcript = action.transcriptArray
      return state
  }
  return state
}

export default transcriptReducer