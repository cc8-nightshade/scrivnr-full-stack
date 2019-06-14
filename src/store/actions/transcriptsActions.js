export const getTranscripts = () => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()
    firestore.collection('transcripts').get()
    .then(querySnapshot => {
      let transcriptArray = []
      querySnapshot.forEach(doc => {
        transcriptArray.push(doc.data())
      });
      dispatch({ type: "GET_TRANSCRIPTS", transcriptArray }
      );
    })
    .catch((err) => {
      dispatch({ type: "GET_TRANSCRIPTS_ERROR", err})
    })
  };
};