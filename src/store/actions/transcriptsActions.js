export const getTranscripts = () => {
  return (dispatch, getState, { getFirestore }) => {
    console.log('get action called')
    const firestore = getFirestore()
    console.log(firestore)
    firestore.collection('transcripts').get()
    .then(querySnapshot => {
      let transcriptArray = []
      querySnapshot.forEach(doc => {
        transcriptArray.push(doc.data())
      });
      console.log(transcriptArray)
      dispatch({ type: "GET_TRANSCRIPTS", transcriptArray }
      );
    })
    .catch((err) => {
      dispatch({ type: "GET_TRANSCRIPTS_ERROR", err})
    })
  };
};