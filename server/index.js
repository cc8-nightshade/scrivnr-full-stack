const express = require("express");
const socket = require("socket.io");
const morgan = require("morgan");
const PORT = process.env.PORT || 9000;
// const speech = require('@google-cloud/speech');
const fs = require("fs");


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
  getTranscription,
  addDialogue
} = require("./serverutil.js");

let connectedUsers = {};
let bufferData = {};
let conversations = {};

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    delete connectedUsers[socket.id];
    console.log(`${socket.id} disconnected. Current connections:`, connectedUsers)
  });
  
  socket.on("initialize", userName => {
    console.log("Initialization (User, socket):", userName, socket.id);
    for (let user in connectedUsers) {
      if (connectedUsers[user]['userName'] === userName) {
        console.log(`User --${userName}-- reconnecting.`);
        delete connectedUsers[user];
      }
    }
    connectedUsers[socket.id] = {
      userName, 
      partnerSocket: null,
      conversationID: null
    };
    console.log(connectedUsers)
  });

  socket.on("rtc-offer", (callingUser, receivingUser, offer) => {
    console.log(`Received offer from ${callingUser} >>> ${receivingUser}`);
    // find receiving user's socket
    let receivingSocket = '';
    for (let user in connectedUsers) {
      if (connectedUsers[user]['userName'] === receivingUser) {
        receivingSocket = user;
        break;
      }
    }
    // If user found in list, forward request
    if (receivingSocket !== '' && io.sockets.connected[receivingSocket] !== undefined) {
      io.to(receivingSocket).emit("rtc-offer", callingUser, socket.id, offer);
      // connectedUsers[socket.id]["partnerSocket"] = receivingSocket;
    } else {
      io.to(socket.id).emit("reject-call", receivingUser);
    }
  });

  socket.on("reject-call", (receiverName, callerSocket) => {
    console.log(`Transferring REJECT message from --${receiverName}-- to --${connectedUsers[callerSocket]["userName"]}--`)
    io.to(callerSocket).emit("reject-call", receiverName);
  }); 

  socket.on("rtc-answer", (callerSocket, answer) => {
    console.log(`transmitting answer from ${socket.id} to ${callerSocket}`);
    io.to(callerSocket).emit("rtc-answer", answer);

    // create new Conversation Object
    const {newID, newConversation} = initializeConversationData(callerSocket, socket.id);
    conversations[newID] = newConversation;
    // Refresh user tracking data: calling user
    connectedUsers[callerSocket]["partnerSocket"] = socket.id;
    connectedUsers[callerSocket]["conversationID"] = newID;
    // Refresh user tracking data: receiving user
    connectedUsers[socket.id]["partnerSocket"] = callerSocket;
    connectedUsers[socket.id]["conversationID"] = newID;
    console.log(`New conversation:`, conversations[newID]);
    console.log(`Connected Users:`, connectedUsers);
  });

  socket.on("new-ice-candidate", (data) => {
    console.log("transmitting ice candidate from", socket.id);
    let targetUser = connectedUsers[socket.id]["partnerSocket"];
    io.to(targetUser).emit("new-ice-candidate", data);
  });

  socket.on("hang-up", () => {
    console.log("Following connection is hanging up", socket.id);
    
    let targetSocket = connectedUsers[socket.id]["partnerSocket"];
    io.to(targetSocket).emit("hang-up");
  });
  
  socket.on("send-blob", (blob64) => {
    if (bufferData[socket.id] === undefined) {
      bufferData[socket.id] = [];
    }
    bufferData[socket.id].push(Buffer.from(blob64, "base64"));
    console.log(`User ${socket.id} has -- ${bufferData[socket.id].length} -- pieces of data`)
    // console.log(bufferData[socket.id][bufferData[socket.id].length - 1]);
  });
  
  socket.on("end-record", async () => {
    if (bufferData[socket.id] !== undefined) {
      var allAudio = Buffer.concat(bufferData[socket.id]);
      let googleResult = await getTranscription(allAudio.toString("base64"), socket.id).catch(console.error);
      googleResult = JSON.parse(googleResult);
      
      let lastUser = false;
      let currentConversation = conversations[connectedUsers[socket.id]['conversationID']];
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
      // Clear data from the server, reset the users' conversation data
      delete bufferData[socket.id];
      connectedUsers[socket.id]['conversationID'] = null;
      connectedUsers[socket.id]['partnerSocket'] = null; 
      console.log(`deleted user ${socket.id} from recording data, leaving ${Object.keys(bufferData)}`);
    }

  });
});
