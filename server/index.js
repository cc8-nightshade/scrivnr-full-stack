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
console.log("Starting server...");
const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
let io = socket(server);
// END HTTP VERSION

// HTTPS version
// let https = require('https');
// const privateKey = fs.readFileSync('./server/ssl/server.key');
// const certificate = fs.readFileSync('./server/ssl/server.cert');
// const credentials = {key: privateKey, cert: certificate};
// let httpsServer = https.createServer(credentials, app);
// httpsServer.listen(PORT);
// console.log(`httpsServer listening on port ${PORT}!`);
// let io = socket(httpsServer);
// console.log(`Attached socket to httpsServer!`);
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
let offers = {};

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

  socket.on("get-online-users", () => {
    let userArray = [];
    for (let userSocket in connectedUsers) {
      if (userSocket !== socket.id) {
        userArray.push(connectedUsers[userSocket]['userName']);
      }
    }
    io.to(socket.id).emit("online-users", userArray);
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
    //NEW METHOD OF HOLDING OFFER
    if (receivingSocket !== '' && io.sockets.connected[receivingSocket] !== undefined) {
      offers[socket.id] = {
        initiateTime: new Date(),
        offer,
        candidates: []
      };
      console.log(`Stored call from ${callingUser} to ${receivingUser} (${receivingSocket})`);
      io.to(receivingSocket).emit("calling", callingUser, socket.id);
    } else {
      io.to(socket.id).emit("reject-call", receivingUser);
    }
    // OLD METHOD OF IMMEDIATE FORWARDING
    // // If user found in list, forward request
    // if (receivingSocket !== '' && io.sockets.connected[receivingSocket] !== undefined) {
    //   io.to(receivingSocket).emit("rtc-offer", callingUser, socket.id, offer);
    //   // connectedUsers[socket.id]["partnerSocket"] = receivingSocket;
    // } else {
    //   io.to(socket.id).emit("reject-call", receivingUser);
    // }
  });
  socket.on("accept-call", (callingUser, callingSocket) => {
    console.log(`call from ${callingUser} accepted by ${socket.id}`);
    // send offer to accepting user
    io.to(socket.id).emit(
      "rtc-offer", 
      callingUser, 
      callingSocket, 
      offers[callingSocket]['offer']
    );
    // sending candidates saved up on the server
    // setTimeout(() => {
      if (offers[callingSocket]['candidates'].length > 0) {
        for (let candidate of offers[callingSocket]['candidates']) {
          io.to(socket.id).emit("new-ice-candidate", candidate);
        }
      }
    // }, 200);
    // create new Conversation Object
    const {newID, newConversation} = 
    initializeConversationData(
      offers[callingSocket]['initiateTime'],
      connectedUsers[callingSocket]['userName'], 
      connectedUsers[socket.id]['userName']
      );
      
      conversations[newID] = newConversation;
      // Refresh user tracking data: calling user
      connectedUsers[callingSocket]["partnerSocket"] = socket.id;
      connectedUsers[callingSocket]["conversationID"] = newID;
      // Refresh user tracking data: receiving user
      connectedUsers[socket.id]["partnerSocket"] = callingSocket;
      connectedUsers[socket.id]["conversationID"] = newID;
      console.log(`New conversation:`, conversations[newID]);
      console.log(`Connected Users:`, connectedUsers);
      
      // clean up offer data
      delete offers[callingSocket];
    });
    
  socket.on("reject-call", (receiverName, callerSocket) => {
    console.log(`Transferring REJECT message from --${receiverName}-- to --${connectedUsers[callerSocket]["userName"]}--`);
    delete bufferData[callerSocket];
    io.to(callerSocket).emit("reject-call", receiverName);
  }); 

  socket.on("rtc-answer", (callerSocket, answer) => {
    console.log(`transmitting answer from ${socket.id} to ${callerSocket}`);
    io.to(callerSocket).emit("rtc-answer", answer);


  });

  socket.on("new-ice-candidate", (candidate) => {
    // store candidate if there is an unanswered call
    if (offers[socket.id] !== undefined) {
      offers[socket.id]['candidates'].push(candidate);
      console.log(`holding ice candidate from ${socket.id}, total candidates: ${offers[socket.id]['candidates'].length}`)
    } 
    else {
      console.log("transmitting ice candidate from", socket.id);
      let targetUser = connectedUsers[socket.id]["partnerSocket"];
      io.to(targetUser).emit("new-ice-candidate", candidate);
    }
  });

  socket.on("hang-up", () => {
    console.log("Following connection is hanging up", socket.id);
    
    let targetSocket = connectedUsers[socket.id]["partnerSocket"];
    io.to(targetSocket).emit("hang-up");
  });
  
  socket.on("send-blob", (base64data) => {
    if (bufferData[socket.id] === undefined) {
      bufferData[socket.id] = [];
    }
    bufferData[socket.id].push(Buffer.from(base64data, "base64"));
    console.log(`User ${socket.id} has -- ${bufferData[socket.id].length} -- pieces of data`)
    // console.log(bufferData[socket.id][bufferData[socket.id].length - 1]);
  });
  
  socket.on("reset-recording", () => {
    if (bufferData[socket.id] !== undefined) {
      console.log("deleting caller's recording from before pickup");
      delete bufferData[socket.id];
      console.log(bufferData[socket.id]);
    }
  });

  socket.on("end-recording", async () => {
    if (bufferData[socket.id] !== undefined) {
      var allAudio = Buffer.concat(bufferData[socket.id]);
      let googleResult = await getTranscription(allAudio.toString("base64"), socket.id).catch(console.error);
      googleResult = JSON.parse(googleResult);
      
      let lastUser = false;
      let currentConversation = conversations[connectedUsers[socket.id]['conversationID']];
      if (currentConversation.speech.length > 0) {
        lastUser = true;
      }

      // for adjustment of times for caller vs receiver
      let recordStartTime = 0; // for receiver, because we want all of their speech
      if (connectedUsers[socket.id]['userName'] === currentConversation.caller) {
        // for caller, do not record audio before pickup
        recordStartTime = currentConversation.timeToPickUp;
      }

      addSpeech(
        currentConversation, 
        extractConversationData(
          connectedUsers[socket.id]['userName'], 
          recordStartTime,
          googleResult
        )
      );

      if (lastUser) {
        console.log("Complete conversation after results", currentConversation);
        addDialogue(currentConversation);
        console.log(`informing ${socket.id}`)
        io.to(socket.id).emit("message", "You're transcription is finished.");
        console.log(`informing ${connectedUsers[socket.id]['partnerSocket']}`)
        io.to(connectedUsers[socket.id]['partnerSocket']).emit("message", "You're transcription is finished.");
      }
      // Clear data from the server, reset the users' conversation data
      delete bufferData[socket.id];
      connectedUsers[socket.id]['conversationID'] = null;
      connectedUsers[socket.id]['partnerSocket'] = null; 
      console.log(`deleted user ${socket.id} from recording data, leaving ${Object.keys(bufferData)}`);
    }

  });
  socket.on("end-recording-only", async () => {
    if (bufferData[socket.id] !== undefined) {
      var allAudio = Buffer.concat(bufferData[socket.id]);
      fs.writeFileSync("./server/test.ogg", allAudio);
      let googleResult = await getTranscription(allAudio.toString("base64"), socket.id).catch(console.error);
      googleResult = JSON.parse(googleResult);
      console.log(googleResult);
    }

  });
});
