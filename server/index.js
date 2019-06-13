const express = require("express");
const socket = require("socket.io");
const morgan = require("morgan");
const PORT = process.env.PORT || 9000;
const speech = require('@google-cloud/speech');
const fs = require("fs");
const { firebase } = require("./firebase");
const db = firebase.firestore();

//var app = express.createServer(credentials);


const app = express();
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'
  )
);
// Serve static HTML page
app.use(express.static('build'));
app.use("/audio", express.static('audio'));


// HTTP VERSION
// console.log("Starting server...");
// const server = app.listen(PORT, () => {
//   console.log(`App listening on port ${PORT}!`);
// });
// let io = socket(server);
// END HTTP VERSION

// HTTPS version
let https = require('https');
const privateKey = fs.readFileSync('./server/ssl/server.key');
const certificate = fs.readFileSync('./server/ssl/server.cert');
const credentials = {key: privateKey, cert: certificate};
let httpsServer = https.createServer(credentials, app);
httpsServer.listen(PORT);
console.log(`httpsServer listening on port ${PORT}!`);
let io = socket(httpsServer);
console.log(`Attached socket to httpsServer!`);
// END HTTPS CODE

const {
  initializeConversationData,
  extractConversationData,
  addSpeech,
  getTranscription
} = require("./serverutil.js");

let connectedUsers = [];
let connectedUsersObject = {};
let bufferData = {};

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    delete connectedUsers[socket.id];
  });
  
  socket.on("initialize", userName => {
    console.log("Initialization (User, socket):", userName, socket.id);
    connectedUsersObject[socket.id] = {
      userName, 
      callPartner: null
    };
    switch (connectedUsers.length) {
      case 0: { // if no users yet, add user as the sole user
        connectedUsers = [socket.id];
        break;
      }
      case 1: { // if only one connected user, add second
        connectedUsers.push(socket.id);
        break;
      }
      case 2: { // if already 2 users, push out last one.
        connectedUsers[0] = connectedUsers[1];
        connectedUsers[1] = socket.id;
      }
    }
    console.log(connectedUsers);
    console.log(connectedUsersObject)
  });

  socket.on("video-offer", (callingUser, offer) => {
    console.log("transmitting video offer from", socket.id);
    let targetSocket = connectedUsers[((connectedUsers.indexOf(socket.id) + 1) % 2)];
    if (io.sockets.connected[targetSocket] !== undefined) {
      io.to(targetSocket).emit("video-offer", callingUser, socket.id, offer);
      connectedUsersObject[socket.id]["callPartner"] = targetSocket;
    } else {
      io.to(socket.id).emit("message", "User has disconnected");
    }
  });

  socket.on("reject-call", (receiverName, callerSocket) => {
    console.log(`Transferring REJECT message from --${receiverName}-- to --${connectedUsersObject[callerSocket]["userName"]}--`)
    io.to(callerSocket).emit("reject-call", receiverName);
  }); 

  socket.on("video-answer", (answer) => {
    console.log("transmitting video answer from", socket.id);
    //console.log(data);
    let targetSocket = connectedUsers[((connectedUsers.indexOf(socket.id) + 1) % 2)];
    connectedUsersObject[socket.id]["callPartner"] = targetSocket;
    let targetUser = connectedUsersObject[socket.id]["callPartner"];
    // let targetUser;
    // if (socket.id === connectedUsers[0]) {
    //   targetUser = connectedUsers[1];
    // } else {
    //   targetUser = connectedUsers[0];
    // }
    io.to(targetSocket).emit("video-answer", answer);
  });
  socket.on("new-ice-candidate", (data) => {
    console.log("transmitting ice candidate from", socket.id);
    let targetUser = connectedUsersObject[socket.id]["callPartner"];
    // let targetUser;
    // if (socket.id === connectedUsers[0]) {
    //   targetUser = connectedUsers[1];
    // } else {
    //   targetUser = connectedUsers[0];
    // }
    io.to(targetUser).emit("new-ice-candidate", data);
  });
  socket.on("hang-up", () => {
    console.log("Following connection is hanging up", socket.id);
    
    let targetSocket = connectedUsersObject[socket.id]["callPartner"];
    connectedUsersObject[socket.id]["callPartner"] = null;
    connectedUsersObject[targetSocket]["callPartner"] = null; 
    // if (socket.id === connectedUsers[0]) {
    //   targetUser = connectedUsers[1];
    // } else {
    //   targetUser = connectedUsers[0];
    // }
    io.to(targetSocket).emit("hang-up");
  });
  
  socket.on("send-blob", (blob64) => {
    if (bufferData[socket.id] === undefined) {
      bufferData[socket.id] = [];
    }
    
    // console.log(blob64.substring(0,30));

    bufferData[socket.id].push(Buffer.from(blob64, "base64"));
    // bufferData[socket.id].push(Buffer.from(blob64));
    console.log(`User ${socket.id} has -- ${bufferData[socket.id].length} -- pieces of data`)
    // console.log(bufferData[socket.id][bufferData[socket.id].length - 1]);
  });
  
  socket.on("end-record", async () => {
    if (bufferData[socket.id] !== undefined) {
      var allAudio = Buffer.concat(bufferData[socket.id]);
      let googleResult = await getTranscription(allAudio.toString("base64"), socket.id).catch(console.error);
      googleResult = JSON.parse(googleResult);
      
      let lastUser = false;
      if (currentConversation.speech.length > 0) {
        lastUser = true;
      }

      addSpeech(
        currentConversation, 
        extractConversationData(socket.id, googleResult)
      );

      if (lastUser) {
        console.log("Complete conversation after results", currentConversation);
        addDialogue(currentConversation);
      }
      delete bufferData[socket.id];
      console.log(`deleted user ${socket.id} from recording data, leaving ${Object.keys(bufferData)}`);
    }

    // if (bufferData[socket.id] !== undefined) {
    //   var allAudio = Buffer.concat(bufferData[socket.id]);
    //   await getTranscription(allAudio.toString("base64"), socket.id).catch(console.error);
    //   delete bufferData[socket.id];
    //   console.log(`deleted user ${socket.id} from recording data, leaving ${Object.keys(bufferData)}`);
    // }
    //fs.writeFileSync("./server/wavtest.wav", )
  });
});

// async function getTranscription(audioBytes, socketID) {
//   // Creates a client
//   const client = new speech.SpeechClient();
//   console.log("length of thing being sent to google", audioBytes.length);
//   const audio = {
//     content: audioBytes,
//     // data: file,
//   };
//   const config = {
//     encoding: 'OGG_OPUS',
//     sampleRateHertz: 48000,
//     languageCode: 'en-US',
//     enableAutomaticPunctuation: true,
//     enableWordTimeOffsets: true,
//   };
//   const request = {
//     audio: audio,
//     config: config,
//   };
 
//   const [operation] = await client.longRunningRecognize(request);
//   // const response = await operation.promise();
//   const fullResponse = await operation.promise();
//   const [response] = fullResponse;
//   console.log(response);
//   // const [response] = await client.recognize(request);
//   // console.log(response);
//   fs.writeFileSync(`./transcriptions/transcription-${socketID}.json`, JSON.stringify(fullResponse));
//   // console.log(`${socketID} said: ${response.results[0].alternatives[0].transcript}`);
//   // const transcription = response.results
//   //   .map(result => result.alternatives[0].transcript)
//   //   .join('\n');
//   // console.log(`Transcription: ${transcription}`);
// }

const addDialogue = (data) => {
  db.collection("dialogues")
  .add(data)
  .then(docRef => {
    console.log(docRef)
  });
}