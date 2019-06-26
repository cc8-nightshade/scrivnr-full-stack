const express = require("express");
const socket = require("socket.io");
const morgan = require("morgan");
const PORT = process.env.PORT || 9000;
const fs = require("fs");
const history = require('connect-history-api-fallback');

// Creating Server, logging
const app = express();
app.use(history());
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'
  )
);
    // Serve static HTML page
app.use(express.static('build'));
app.use("/audio", express.static('audio'));

// Starting HTTP or HTTPS, depending on environment
let io;
if(process.env.ISHEROKU) {
  // HTTP VERSION
  console.log("Starting server...");
  const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
  });
  io = socket(server);
} else {
  // HTTPS version
  let https = require('https');
  const privateKey = fs.readFileSync('./server/ssl/server.key');
  const certificate = fs.readFileSync('./server/ssl/server.cert');
  const credentials = {key: privateKey, cert: certificate};
  let httpsServer = https.createServer(credentials, app);
  httpsServer.listen(PORT);
  console.log(`httpsServer listening on port ${PORT}!`);
  io = socket(httpsServer);
  console.log(`Attached socket to httpsServer!`);
}

const {
  initializeConversationData,
  extractConversationData,
  addSpeech,
  getTranscription,
  addDialogue,
  createOnlineUserList
} = require("./serverutil.js");

// State objects used to hold server data
let connectedUsers = {};
let offers = {};
let conversations = {};
let bufferData = {};
let processing = {};

// Definition of server-side socket
io.on("connection", (socket) => {

  socket.on("disconnect", () => {
    // Clear data if remaining
    if (bufferData[socket.id]) {
      delete bufferData[socket.id];
      console.log("cleared disconnecting user's old buffers")
    }
    if (offers[socket.id]) {
      delete offers[socket.id];
      console.log("cleared disconnecting user's old offers")
    }
    // Clear from connected users
    if (connectedUsers[socket.id]) {
      delete connectedUsers[socket.id];
      console.log("cleared disconnecting user's old connection data")
    }
    // Update other online users with 
    io.emit("online-users", 
      createOnlineUserList(socket.id, connectedUsers)
    );
    console.log(`${socket.id} disconnected. Current connections:`, connectedUsers)
  });
  
  socket.on("initialize", userName => {
    console.log("Initialization (User, socket):", userName, socket.id);
    // Delete user first from connectedUsers if was just connected
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
    io.emit("online-users", 
      createOnlineUserList(socket.id, connectedUsers)
    );
    console.log(connectedUsers)
  });

  socket.on("get-online-users", () => {
    io.to(socket.id).emit("online-users", 
      createOnlineUserList(socket.id, connectedUsers)
    );
  });

  socket.on("rtc-offer", (callingUser, receivingUser, offer) => {  
    // Handle rare case where user's connection was persistent but server rebooted.
    if (connectedUsers[socket.id] === undefined) {
      io.to(socket.id).emit("message", "Please refresh page to reconnect to server.");
    } else {
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
      } else { // REJECT IF CAN'T FIND USER/SOCKET
        io.to(socket.id).emit("reject-call", receivingUser);
      }
    }
  });

  socket.on("accept-call", (callingUser, callingSocket) => {
    console.log(`call from ${callingUser} accepted by ${socket.id}`);
    if(offers[callingSocket] !== undefined) {
      // send offer to accepting user
      io.to(socket.id).emit(
        "rtc-offer", 
        callingUser, 
        callingSocket, 
        offers[callingSocket]['offer']
      );
      // sending candidates saved up on the server
      if (offers[callingSocket]['candidates'].length > 0) {
        for (let candidate of offers[callingSocket]['candidates']) {
          io.to(socket.id).emit("new-ice-candidate", candidate);
        }
      }
    } else {
      io.to(socket.id).emit("message", "Sorry, but the calling user has cancelled/disconnected.");
      console.log(`Accept ignored from ${socket.id} due to no corresponding data.`)
    }

  });
    
  socket.on("reject-call", (receiverName, callingSocket) => {
    console.log(`Got REJECT message from --${receiverName}-- to --${connectedUsers[callingSocket]["userName"]}--`);
    if (offers[callingSocket] !== undefined) {
      // Tell calling user
      io.to(callingSocket).emit("reject-call", receiverName);
      // Clear offer data
      delete offers[callingSocket];
      console.log(`Deleted offer data for rejected call from ${callingSocket}`)
      setTimeout(() => {
        delete bufferData[callingSocket];
        console.log(`Deleted buffer data for ${callingSocket}`)
      }, 3000);
    } else {
      console.log(`Reject ignored from ${receiverName} due to no corresponding data.`)
    }
  }); 

  socket.on("rtc-answer", (callingSocket, answer) => {
    // record time first
    let pickUpDateTime = new Date();
    
    console.log(`transmitting answer from ${socket.id} to ${callingSocket}`);
    io.to(callingSocket).emit("rtc-answer", answer);
    
    // create new Conversation Object
    const {newID, newConversation} = 
      initializeConversationData(
        offers[callingSocket]['initiateTime'],
        pickUpDateTime,
        connectedUsers[callingSocket]['userName'], 
        callingSocket,
        connectedUsers[socket.id]['userName'],
        socket.id
      );
    
    // insert new conversation in the state
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

  socket.on("new-ice-candidate", (candidate) => {
    // First, check to see if user calling is registered
    if (connectedUsers[socket.id] !== undefined) {
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
    }
  });

  socket.on("bookmark", () => {
    let bookmarkDateTime = new Date();
    // If conversation exists, continue with processing
    if(conversations[connectedUsers[socket.id]['conversationID']]) {
      let conversation = conversations[connectedUsers[socket.id]['conversationID']];
      let bookmarkTime = Math.round((bookmarkDateTime - conversation.bookmarks[socket.id]['startTime']) / 100) / 10;
      conversation.bookmarks[socket.id]['bookmarks'].push(bookmarkTime);
      console.log(`Bookmark -- User (${socket.id}) Time (${bookmarkTime})`);
    }
  });

  socket.on("hang-up", () => {
    if (connectedUsers[socket.id]["partnerSocket"] !== null) {
      console.log("Following connection is hanging up", socket.id);
      // Forward Hang-up to partnerSocket
      let targetSocket = connectedUsers[socket.id]["partnerSocket"];
      io.to(targetSocket).emit("hang-up");
    } else if (offers[socket.id] !== null) {
      // This section is performed when call is cancelled by caller.
      console.log(`connection ${socket.id} is cancelling. Removing data..`);
      delete offers[socket.id];
      if(bufferData[socket.id] !== null) {
        setTimeout(() => {
          delete bufferData[socket.id];
          console.log(`Deleted buffer data for ${socket.id}`);
        }, 3000);
      }
    }
  });
  
  socket.on("send-blob", (base64data) => {
    if (bufferData[socket.id] === undefined) {
      bufferData[socket.id] = [];
    }
    bufferData[socket.id].push(Buffer.from(base64data, "base64"));
    console.log(`User ${socket.id} has -- ${bufferData[socket.id].length} -- pieces of data`)
  });
  
  socket.on("reset-recording", () => {
    if (bufferData[socket.id] !== undefined) {
      console.log("deleting caller's recording from before pickup");
      delete bufferData[socket.id];
      console.log(bufferData[socket.id]);
    }
  });

  socket.on("end-recording", async () => {
    // telling user their transcription is being processed
    io.to(socket.id).emit("message", "Your transcription is being processed.\nThis could take several minutes for longer conversations.\nYou will get another alert when processing is done.");
    
    // Extract important properties for reference, then clear from connectedUsers (Allows for next conversation)
    let conversationID = connectedUsers[socket.id]['conversationID'];
    let partnerSocket = connectedUsers[socket.id]['partnerSocket'];
    connectedUsers[socket.id]['conversationID'] = null;
    connectedUsers[socket.id]['partnerSocket'] = null; 

    // If conversation has yet to be moved to processing, move it
    if (conversations[conversationID] !== undefined) {
      processing[conversationID] = JSON.parse(JSON.stringify(conversations[conversationID]));
      processing[conversationID]['startDateTime'] = new Date(processing[conversationID]['startDateTime']);
      delete conversations[conversationID];
      console.log(`moved conversation ${conversationID} from current data, leaving ${Object.keys(conversations)}`);
    }
    
    let currentConversation = processing[conversationID];
    
    if (bufferData[socket.id] !== undefined) {
      var allAudio = Buffer.concat(bufferData[socket.id]);
      console.log(`Sending ${socket.id} data (length ${allAudio.length}) to Google`);
      delete bufferData[socket.id];
      console.log(`deleted user ${socket.id} from recording data, leaving ${Object.keys(bufferData)}`);
      let googleResult = await getTranscription(allAudio.toString("base64"), socket.id).catch(console.error);

      let lastUser = (currentConversation.speech.length > 0) ? true : false;
        
      // for adjustment of times for caller vs receiver
          // for receiver, because we want all of their speech
      let transcribeStartTime = 0; 
          // for caller, pass time of pickup so we can delete their pre-pickup statements
      if (connectedUsers[socket.id]['userName'] === currentConversation.caller) {
        transcribeStartTime = currentConversation.timeToPickUp;
      }
      console.log(`Received Google Result for ${socket.id}`);
      addSpeech(
        connectedUsers[socket.id]['userName'],
        currentConversation, 
        extractConversationData(
          connectedUsers[socket.id]['userName'], 
          transcribeStartTime,
          googleResult
        ),
        currentConversation.bookmarks[socket.id]['bookmarks']
      );

      if (lastUser) {
        // Delete bookmark data from conversation before saving
        delete currentConversation.bookmarks;
        // Push transcription to Firebase
        console.log("Complete conversation after results", currentConversation);
        addDialogue(currentConversation);
        
        console.log("Deleting conversation ${conversationID} after processing");
        delete processing[conversationID];

        // Inform users
        console.log(`informing ${socket.id}`)
        io.to(socket.id).emit("message", "Your transcription is finished.");
        console.log(`informing ${partnerSocket}`)
        io.to(partnerSocket).emit("message", "You're transcription is finished.");
      }
    }
  });

});
