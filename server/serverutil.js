const shortid = require("shortid");
const speech = require("@google-cloud/speech");

const initializeConversationData = (caller, receiver) => {
  let id = shortid.generate();
  let startDateTime = new Date();
  return {
    id,
    caller,
    receiver,
    speech: [],
    startDateTime
  };
};

const extractConversationData = (speaker, googleArray) => {
  let speechArray = [];
  let results = googleArray[0].results;
  if (results === undefined) {
    return [{
      speaker,
      text: "Did not speak/not intelligible",
      time: 0
    }];
  } 
  for (let result of results) {
    let text = result.alternatives[0].transcript;
    let time = 0;
    let timeObject = result.alternatives[0].words[0].startTime;
    if (timeObject.seconds !== undefined) {
      time += parseInt(timeObject.seconds);
    }
    if (timeObject.nanos !== undefined) {
      time += timeObject.nanos/(Math.pow(10,9));
    }
    let thisSpeech = {
    };
    speechArray.push({
      speaker,
      text,
      time
    });
  }
  return speechArray;
};

const addSpeech = (conversation, newSpeechArray) => {
  let pleaseSort = false;
  if (conversation.speech.length > 0) {
    pleaseSort = true;
  }
  conversation.speech = conversation.speech.concat(newSpeechArray);
  if (pleaseSort) {
    console.log("needs sorting");
    conversation.speech.sort((a,b) => {
      return a.time <= b.time ? -1 : 1;
    });
  }
};

const getTranscription = async (audioBytes, socketID) => {
  // Creates a client
  const client = new speech.SpeechClient();
  console.log(`Sending ${socketID} data (${audioBytes.length} bytes) to Google`);
  const audio = {
    content: audioBytes,
    // data: file,
  };
  const config = {
    encoding: 'OGG_OPUS',
    sampleRateHertz: 48000,
    languageCode: 'en-US',
    enableAutomaticPunctuation: true,
    enableWordTimeOffsets: true,
  };
  const request = {
    audio: audio,
    config: config,
  };
 
  const [operation] = await client.longRunningRecognize(request);
  const fullResponse = await operation.promise();
  // console.log("response inside getTranscription", JSON.stringify(fullResponse));

  // ---------------- UNCOMMENT TO WRITE DATA TO FILE
  //fs.writeFileSync(`./server/sample-transcription-${socketID}.json`, JSON.stringify(fullResponse));
  return(JSON.stringify(fullResponse));
}

module.exports = {
  initializeConversationData,
  extractConversationData,
  addSpeech,
  getTranscription
};
