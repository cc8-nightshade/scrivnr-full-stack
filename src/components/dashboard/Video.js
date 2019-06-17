import React, { Component } from 'react'
import io from 'socket.io-client'
import Recorder from 'opus-recorder';

export default class Video extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mySocket: undefined,
      myPeerConnection: undefined,
      mediaRecorder: undefined,
      receiverName: null,
    }
  }

  componentDidMount(){
    this.initialConnect();
  }

  initialConnect = async () => {
    // Get user's name and set it to state.
    // let myName = prompt("Please enter your name", "Harry Potter");
    let myName = 'x'
    await this.setState({myName});

    // Initialize Socket
    const tempSocket = io.connect();
    // Initialize Socket Details
    {
      tempSocket.on("message", (messageData) => {
        alert(messageData);
      });
      tempSocket.on("rtc-offer", (callingUser, callingSocket, offerData) => {
        console.log("receiving offer", offerData);
        if (this.state.myPeerConnection === undefined) {
          console.log("Continuing to process processing offer", offerData);
          this.handleOfferMessage(callingUser, callingSocket, offerData);
        }
      });
      tempSocket.on("reject-call", (receiverName) => {
        alert(`${receiverName} does not exist or rejected your call.`);
        this.endCall();
      });
      tempSocket.on("rtc-answer", (answerData) => {
        this.handleAnswerMessage(answerData);
      });
      tempSocket.on("new-ice-candidate", (iceCandidate) => {
        this.handleNewICECandidateMsg(iceCandidate);
      });
      tempSocket.on("hang-up", () => {
        this.endCall();
      });
    }

    // Store configured socket in state
    await this.setState({
      mySocket: tempSocket
    });
    console.log("Initialized client-side socket: ", this.state.mySocket);
    // talk to socket server to say "I'm online"
    this.state.mySocket.emit("initialize", this.state.myName);
  }

  startCall = async () => {
    const receiverName = prompt('Who do you want to call?', 'Voldemort');
    console.log(receiverName);
    if (receiverName !== "") {
      console.log("Starting a call");
      this.setState({
        receiverName
      });
      
      await this.createPeerConnection();
      console.log("Created caller's connection", this.state.myPeerConnection);
      
      this.setUpOpusRecorder();
      console.log("Created recorder");
  
      const mediaConstraints = {audio: true, 
        // video: true
      };
      navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then((localStream) => {
          document.getElementById("local_video").srcObject = localStream;
          localStream.getTracks().forEach(track => this.state.myPeerConnection.addTrack(track, localStream));
          console.log("Tracks added to connection");
        });
    } 
    else { // If they didn't enter any name
      alert("Please enter a user name");
    }
  }
  
  createPeerConnection = async () => {
    let newPeerConnection = await new RTCPeerConnection({
        iceServers: [{urls: "stun:stun.l.google.com:19302"}]
    });
    newPeerConnection.onicecandidate = this.handleICECandidateEvent;
    newPeerConnection.ontrack = this.handleTrackEvent;
    newPeerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent;
    // Other Things that could be implemented for 
    // state.myPeerConnection.onremovetrack = handleRemoveTrackEvent;
    // state.myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    // state.myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    // state.myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
    
    await this.setState({
      myPeerConnection: newPeerConnection
    });
  }
  
  handleNegotiationNeededEvent = async () => {
    // this outer "if" will stop the callee from creating their own offer automatically when they mount their streams
    if (!this.state.myPeerConnection.remoteDescription && !this.state.myPeerConnection.localDescreption) { 
      await this.state.myPeerConnection.createOffer()
        .then((offer) => {
          this.state.myPeerConnection.setLocalDescription(offer);
          console.log("Offer created, sending to server:", offer)
        });
      this.state.mySocket.emit(
        "rtc-offer", 
        this.state.myName,
        this.state.receiverName,
        {
          sdp: this.state.myPeerConnection.localDescription
        }
      );
    }
    // TODO  .catch(reportError);
  }
  
  handleTrackEvent = (event) => {
    console.log("Handling track event (incoming answer)");
    document.getElementById("received_video").srcObject = event.streams[0];
  }
  
  handleOfferMessage = async (callerName, callerSocket, offerData) => {
    // Check to see if they accept, and only continue setting up connection if yes
    console.log("session description receiving", offerData.sdp);
    
    if (window.confirm(`Would you like to accept a call from ${callerName}?`)) {
      await this.createPeerConnection();
      await this.state.myPeerConnection.setRemoteDescription(offerData.sdp);
      await this.setUpOpusRecorder();

      let mediaConstraints = {audio: true, 
        // video: true
      };
      await navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then((localStream) => {
          document.getElementById("local_video").srcObject = localStream;
          localStream.getTracks().forEach(track => this.state.myPeerConnection.addTrack(track, localStream));
          this.state.mediaRecorder.start(localStream);
        });
      await this.state.myPeerConnection.createAnswer()
        .then((answer) => {
          this.state.myPeerConnection.setLocalDescription(answer);
        });
      console.log("Answer created and sending:", this.state.myPeerConnection.localDescription)
      this.state.mySocket.emit(
        "rtc-answer", 
        callerSocket, 
        {sdp: this.state.myPeerConnection.localDescription}
      );
    } 
    else { // If the user rejects call
      this.state.mySocket.emit("reject-call", this.state.myName, callerSocket);
      this.resetMyPeerConnection();
      // TODO Destroy recorder!
    }
  }
  
  handleAnswerMessage = (answerData) => {
    const mediaConstraints = {audio: true, 
      // video: true
    };
    navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then((localStream) => {
        this.state.mediaRecorder.start(localStream);
        console.log("Started Recording");
      });
    console.log("handling answer", answerData.sdp);
    this.state.myPeerConnection.setRemoteDescription(answerData.sdp)
      .then(() => {
        console.log("processed answer successfully")
      })
      .catch((err) => console.log("error handling answer", err));
  }
  
  handleICECandidateEvent = (event) => {
    console.log("sending new ICE candidate");
    if (event.candidate) {
      this.state.mySocket.emit("new-ice-candidate", {
        candidate: event.candidate
      });
    }
  }
  
  handleNewICECandidateMsg = (msg) => {
    console.log("receiving and processing new ICE candidate");
    const candidate = new RTCIceCandidate(msg.candidate);
    this.state.myPeerConnection.addIceCandidate(candidate);
      // TODO .catch(reportError);
  }

    // ENDING OF CALLS
  hangUpCall = () => {
    console.log("Hanging up call");
    this.state.mySocket.emit("hang-up");
    this.endCall();
  }

  // Refactored out of hangUpCall because it needs to be run when the other party hangs up  
  endCall = () => {
    console.log("Shutting down call.")
    if (this.state.mediaRecorder) {
      this.state.mediaRecorder.stop();
      setTimeout(() => {this.state.mySocket.emit("end-record");}, 3000);
    }
    this.resetMyPeerConnection();
    this.setState({
      mediaRecorder: null
    });
    // TODO - Change color of buttons etc based on call status
  }

  setUpOpusRecorder = async () => {
    let recorderConfig = {
      encoderPath: "../audio/encoderWorker.min.js",
      numberOfChannels: 1,
      streamPages: true,
      originalSampleRateOverride: 48000
    };
    let rec = new Recorder (recorderConfig);
    rec.ondataavailable = (arrayBuffer) => {
      this.state.mySocket.emit("send-blob", this.bufferToBase64(arrayBuffer));
    };
    rec.onstart = () => {console.log("recorder started")};
    await this.setState({
      mediaRecorder: rec
    });
  }

  // Utility for setUpOpusRecorder to change buffer to base64
  bufferToBase64 = (buf) => {
    let binstr = buf.map(char => String.fromCharCode(char)).join('');
    return btoa(binstr);
  } 

  resetMyPeerConnection = async () => {
    if (this.state.myPeerConnection) {
      // Nulling out connection
      this.state.myPeerConnection.ontrack = null;
      this.state.myPeerConnection.onremovetrack = null;
      this.state.myPeerConnection.onremovestream = null;
      this.state.myPeerConnection.onicecandidate = null;
      this.state.myPeerConnection.oniceconnectionstatechange = null;
      this.state.myPeerConnection.onsignalingstatechange = null;
      this.state.myPeerConnection.onicegatheringstatechange = null;
      this.state.myPeerConnection.onnegotiationneeded = null;
      
      // stopping tracks, resetting HTML
      const remoteVideo = document.getElementById("received_video");
      const localVideo = document.getElementById("local_video");
      if (remoteVideo.srcObject) {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.removeAttribute("src");
        remoteVideo.removeAttribute("srcObject");
      }
      if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(track => track.stop());
        localVideo.removeAttribute("src");
        localVideo.removeAttribute("srcObject");
      }

      // closing connection and resetting state
      this.state.myPeerConnection.close();
      await this.setState({
        myPeerConnection: undefined
      });
    }
  }

  // For test of ONLY recording. LEFT FOR REFERENCE ONLY
  // startRecording = async () => {
  //   var mediaConstraints = {
  //     audio: true
  //   };
  //   // ---------------------START OPUS-RECORDER CODE
  //   let recorderConfig = {
  //     encoderPath: "../audio/encoderWorker.min.js",
  //     numberOfChannels: 1,
  //     streamPages: true,
  //     originalSampleRateOverride: 16000
  //   };
  //   let rec = new Recorder (recorderConfig);
  //   rec.ondataavailable = (arrayBuffer) => {
  //     // STRING ATTEMPT
  //     //let sendString = "[" + arrayBuffer.toString() + "]";
  //     //console.log(sendString);
  //     this.state.mySocket.emit("send-blob", this.bufferToBase64(arrayBuffer));

  //   };
    
  //   rec.onstart = function () {console.log("recorder started")};
  //   await this.setState({
  //     mediaRecorder: rec
  //   });
    
  //   navigator.mediaDevices.getUserMedia(mediaConstraints)
  //     .then((localStream) => {
  //       this.state.mediaRecorder.start(localStream);
  //     });
  // }
  
  // For stand-alone recording tests. LEFT FOR REFERENCE ONLY
  stopRecording = () => {
    this.state.mediaRecorder.stop();
    setTimeout(() => {
      console.log("asking server to translate");
      this.state.mySocket.emit("end-record");
    }, 2000);
  }

  // ----------------------- LEFT FOR REFERENCE ONLY ------------------------
  // ----------------------- OLD CODE FOR CHANGING blob TO base64 ------------------------
  // onData = (e) => {
  //   if (e !== undefined) {
  //     console.log("currentData", e);
  //     this.state.reader.readAsDataURL(e); 
  //     this.state.reader.onloadend = () => {
  //       // console.log(this.state.reader.result); //.substring(22));
  //       console.log("final data", this.state.reader.result.substring(22)); //.substring(22));
  //       this.state.mySocket.emit("send-blob", this.state.reader.result.substring(22));
  //     }
  //   }
  // }

 
  render() {
    return (

    <div>

      <div className="container video-wrapper">
        {/* <div onClick={this.initialConnect}>Click me to connect to socket.io</div> */}
          <div className="camera-box">
            <video id="received_video" autoPlay></video>
            <video id="local_video" autoPlay muted></video>
          </div>
        
      </div>
      <div className="button-wrapper">
        <button onClick={this.startCall} className="waves-effect waves-light btn-large">Start Chat</button>
        {/* <button onClick={this.acceptCall} className="waves-effect waves-light btn-large">Accept Call</button> */}
        <button id="hangup-button" className="waves-effect waves-light blue darken-1 btn-large" onClick={this.hangUpCall}>
          Hang Up
        </button>
        <button id="record" onClick={this.startRecording}>
          record
        </button>
        <button id="stop-recording" onClick={this.stopRecording}>
          Stop
        </button>
      </div>
    </div>
    )
  }
}

