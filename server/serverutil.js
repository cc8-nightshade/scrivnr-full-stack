const shortid = require("shortid");
const speech = require("@google-cloud/speech");
const { firebase } = require("./firebase");
const db = firebase.firestore();
const moment = require("moment");

const initializeConversationData = (initiateTime, caller, receiver) => {
  let startDateTime = (() => {
    return new Date();
  })();

  console.log(startDateTime);
  // Calculate time to pick up to tenth of a second for later processing
  const timeToPickUp =
    Math.round((startDateTime - initiateTime) / 100) / 10;
  let id = moment(startDateTime).format("YYYYMMDDHHMM") + shortid.generate();
  return {
    newID: id,
    newConversation: {
      id,
      caller,
      receiver,
      speech: [],
      startDateTime,
      timeToPickUp,
      bookmarks: []
    }
  };
};

const extractConversationData = (speaker, recordStartTime, googleArray) => {
  let speechArray = [];
  let results = googleArray[0].results;
  if (results === undefined) {
    return [
      {
        speaker,
        text: "Did not speak/not intelligible",
        time: 0,
        bookmark: false,
        questionable: true
      }
    ];
  }
  for (let result of results) {
    // get text
    let text = result.alternatives[0].transcript;
    // Get and Procees time
    let time = 0 - recordStartTime;
    let timeObject = result.alternatives[0].words[0].startTime;
    if (timeObject.seconds !== undefined) {
      time += parseInt(timeObject.seconds);
    }
    if (timeObject.nanos !== undefined) {
      time += timeObject.nanos / Math.pow(10, 9);
    }
    // Checking questionable result
    let questionable = result.alternatives[0].confidence < 0.9 ? true : false;

    if (time > 0) {
      // Pushing element
      speechArray.push({
        speaker,
        text,
        time,
        bookmark: false,
        questionable
      });
    }
  }
  return speechArray;
};

const addSpeech = (userName, conversation, newSpeechArray, bookmarks) => {
  // let pleaseSort = false;
  // if (conversation.speech.length > 0) {
  //   pleaseSort = true;
  // }
  conversation.speech = conversation.speech.concat(newSpeechArray);
  for (let bookmark of bookmarks) {
    conversation.speech.push({
      speaker: userName,
      text: "",
      time: bookmark,
      bookmark: true,
      questionable: false
    })
  }
  // if (pleaseSort) {
  //   // console.log("needs sorting");
  //   conversation.speech.sort((a, b) => {
  //     return a.time <= b.time ? -1 : 1;
  //   });
  // }
};

const getTranscription = async (audioBytes, socketID) => {
  // Creates a client
  const client = new speech.SpeechClient();
  console.log(
    `Sending ${socketID} data (${audioBytes.length} bytes) to Google`
  );
  const audio = {
    content: audioBytes
    // data: file,
  };
  const config = {
    encoding: "OGG_OPUS",
    sampleRateHertz: 48000,
    languageCode: "en-US",
    enableAutomaticPunctuation: true,
    enableWordTimeOffsets: true
  };
  const request = {
    audio: audio,
    config: config
  };

  const [operation] = await client.longRunningRecognize(request);
  const fullResponse = await operation.promise();
  // console.log("response inside getTranscription", JSON.stringify(fullResponse));

  // ---------------- UNCOMMENT TO WRITE DATA TO FILE
  //fs.writeFileSync(`./server/sample-transcription-${socketID}.json`, JSON.stringify(fullResponse));
  return JSON.stringify(fullResponse);
};

const addDialogue = data => {
  db.collection("dialogues")
    .add(data)
    .then(docRef => {
      // console.log(docRef);
      console.log("Successfully saved data to FireStore");
    });
};

module.exports = {
  initializeConversationData,
  extractConversationData,
  addSpeech,
  getTranscription,
  addDialogue
};
