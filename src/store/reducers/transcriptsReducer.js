const GET_TRANSCRIPTS = "transcripts/GET_TRANSCRIPTS";
const SET_TRANSCRIPT = "transcripts/SET_TRANSCRIPT";
const UPDATE_QUESTIONABLE = "transcripts/UPDATE_QUESTIONABLE";
const intitialState = {
  transcripts: [],
  transcript: {},
  selectedIndex: 0
};

const transcriptReducer = (state = intitialState, action) => {
  switch (action.type) {
    case GET_TRANSCRIPTS: {
      console.log("get trans reducer called", action.transcriptsArray);
      state.transcripts = action.transcriptsArray;
      return state;
    }
    case SET_TRANSCRIPT: {
      console.log("set tran reducer called", action.transcript);
      state.transcript = action.transcript;
      state.selectedIndex = action.index;
      return state;
    }
    case UPDATE_QUESTIONABLE: {
      state.transcript = action.transcript;
      state.transcripts[state.selectedIndex] = state.transcript;
      return state;
    }
    default:
      return state;
  }
};

export default transcriptReducer;
