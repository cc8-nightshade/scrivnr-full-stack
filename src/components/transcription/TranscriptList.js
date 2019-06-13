import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import firebase from "../../config/fbConfig";
import moment from 'moment';

const db = firebase.firestore();

const TranscriptList = () => {
  useEffect(() => {
    fetchList();
  }, []);

  const [items, setItems] = useState([]);
  const fetchList = async () => {


    db.collection("dialogues")
      .get()
      .then(querySnapshot => {
        const postArray = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          postArray.push({
            caller: data.caller,
            receiver: data.receiver,
            speech: data.speech,
            startDate: data.startDateTime,
            id: data.id
          });
        });
        setItems(postArray);
      });
  };

  return (
    <div>
      <h2>Transcript</h2>
      {items.map(item => (
        <h3 key={item.id}>
        <Link to={`/dialogues/${item.id}`}>
            {console.log(moment)}
            {`${item.caller}/${item.receiver}: ${moment.duration(new Date() - item.startDate.toDate()).humanize()}`}
        </Link>
        </h3>
      ))}
    </div>
  );
};

export default TranscriptList;
