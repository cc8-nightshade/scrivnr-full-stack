import React, { useState, useEffect } from "react";
import firebase from "../../config/fbConfig";
import styles from "./TranscriptDetail.css";
import moment from 'moment';

const db = firebase.firestore();

const TranscriptDetail = ({ match }) => {
  useEffect(() => {
    fetchDialogue();
  }, []);

  const [item, setItem] = useState({});
  const fetchDialogue = async () => {
    db.collection("dialogues")
      .where("id", "==", match.params.dialogueId)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const data = doc.data();
          setItem({
            caller: data.caller,
            receiver: data.receiver,
            speech: data.speech,
            startDate: data.startDateTime,
            id: data.id
          });
        });
      });
  };

  return (
    <div className="container">
      <h2>Detail</h2>
      <ul>
        {item.speech && item.speech.map((segment,index) => (
            <li key={index}
            className={segment.speaker === item.caller? 'alignLeft': 'alignRight'}>
                <span className='textBox'>{segment.text}</span>
                
            </li>))}
      </ul>
    </div>
  );
};

export default TranscriptDetail;
