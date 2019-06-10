const intitialState = {
  transcript: [
    { id: 1,
      caller: 'ABC',
      receiver: '123',
      startDateTime: '2020:9:11:14:34:52',
      speech: [
        { time: '12:00:23',
          text: 'Hey there Frank!'
        },
        { time: '12:00:30',
          text: 'Who is this?'
        },
      ]
    }
  ]
}


const transcriptReducer = (state = intitialState, action) => {
 return state
}

export default transcriptReducer