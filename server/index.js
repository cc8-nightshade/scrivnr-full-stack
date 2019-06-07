const express = require("express");
const socket = require("socket.io");
const morgan = require("morgan");
const PORT = process.env.PORT || 9000;
// const fs = require("fs");
// var https = require('https');

// var privateKey = fs.readFileSync('./server/ssl/server.key');
// var certificate = fs.readFileSync('./server/ssl/server.cert');
// var credentials = {key: privateKey, cert: certificate};

//var app = express.createServer(credentials);


const app = express();
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'
  )
);
// Serve static HTML page
app.use(express.static('build'));



console.log("Starting express...");
// console.log('Please visit: https://localhost:9000/')
const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
// Setup logger

// HTTPS
// var httpsServer = https.createServer(credentials, app);

// httpsServer.listen(9000);

let io = socket(server);

let connectedUsers = [];

io.on("connection", (socket) => {
  socket.on("initialize", () => {
    console.log("receiving initialization from", socket.id);
    //io.to(socket.id).emit("message", "You are connected");
    if (connectedUsers.length === 1) {
      connectedUsers.push(socket.id);
    } else {
      connectedUsers = [socket.id];
    }
    console.log(connectedUsers);
  });

  socket.on("video-offer", (data) => {
    console.log("transmitting video offer from", socket.id);
    let targetUser;
    if (socket.id === connectedUsers[0]) {
      targetUser = connectedUsers[1];
    } else {
      targetUser = connectedUsers[0];
    }
    io.to(targetUser).emit("video-offer", data);
  });

  socket.on("video-answer", (data) => {
    console.log("transmitting video answer from", socket.id);
    //console.log(data);
    let targetUser;
    if (socket.id === connectedUsers[0]) {
      targetUser = connectedUsers[1];
    } else {
      targetUser = connectedUsers[0];
    }
    io.to(targetUser).emit("video-answer", data);
  });
  socket.on("new-ice-candidate", (data) => {
    console.log("transmitting ice candidate from", socket.id);
    let targetUser;
    if (socket.id === connectedUsers[0]) {
      targetUser = connectedUsers[1];
    } else {
      targetUser = connectedUsers[0];
    }
    io.to(targetUser).emit("new-ice-candidate", data);
  });
  socket.on("hang-up", () => {
    console.log("transmitting ice candidate from", socket.id);
    let targetUser;
    if (socket.id === connectedUsers[0]) {
      targetUser = connectedUsers[1];
    } else {
      targetUser = connectedUsers[0];
    }
    io.to(targetUser).emit("hang-up");
  });

});