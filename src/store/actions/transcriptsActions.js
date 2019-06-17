export const getTranscripts = () => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()
    firestore.collection("dialogues")
    .orderBy('startDateTime', 'desc')
    .get()
    .then(querySnapshot => {
      let transcriptsArray = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          transcriptsArray.push({
            caller: data.caller,
            receiver: data.receiver,
            speech: data.speech,
            startDate: data.startDateTime,
            id: doc.id
          });
        });
      dispatch({ type: "transcripts/GET_TRANSCRIPTS", transcriptsArray });
    })
    .catch((err) => {
      dispatch({ type: "transcripts/GET_TRANSCRIPTS_ERROR", err})
    })
  };
};

export const setTranscript = (transcript, index) => {
  //const transcript = {}
  console.log("set transcript");
  //console.log(getState);
  return {type: "transcripts/SET_TRANSCRIPT", transcript, index};
}

export const updateQuestionable = (transcript, index) => {
  return (dispatch, getState, {getFirestore}) => {
    const firestore = getFirestore()
    transcript.speech[index].questionable = !transcript.speech[index].questionable;
    firestore.collection("dialogues").doc(transcript.id)
          .update({
            "speech": transcript.speech
          }).then(() => {
            dispatch({ type: "transcripts/UPDATE_QUESTIONABLE", transcript, index });
          })
  }
}