import React, { Component } from 'react'
import io from 'socket.io-client'
// import socketIOClient from 'socket.io-client'
import {ReactMic} from "@cleandersonlobo/react-mic";
// import Recorder from 'recorder-js';
import Recorder from 'opus-recorder';

export default class Video extends Component {
  constructor(props) {
    super(props)

    this.state = {
      mySocket: '',
      myPeerConnection: undefined,
      acceptCall: false,
      mediaRecorder: undefined,
      reader: new FileReader(),
      isRecording: false
      
    }
  }

  componentDidMount(){
    document.addEventListener("loadend", this.initialConnect());
    // this.initialConnect()

  }

  initialConnect = async () => {
    const tempSocket = io.connect();
    // const tempSocket = io.connect();
    
    tempSocket.on("message", (messageData) => {
      alert(messageData);
    });
    tempSocket.on("video-offer", (videoOfferData) => {
      console.log("receiving video offer", videoOfferData);
      if (this.state.myPeerConnection === undefined) {
        console.log("handling video offer", videoOfferData);
        this.handleVideoOfferMessage(videoOfferData);
      }
    });
    tempSocket.on("video-answer", (videoAnswerData) => {
      this.handleVideoAnswerMessage(videoAnswerData);
    });
    tempSocket.on("new-ice-candidate", (iceCandidate) => {
      this.handleNewICECandidateMsg(iceCandidate);
    });
    await this.setState({
      mySocket: tempSocket
    });
    tempSocket.on("hang-up", () => {
      this.closeVideoCall();
    });
    console.log("Initializing client-side socket: ", this.state.mySocket);
    this.state.mySocket.emit("initialize");
  }

  startCall = async () => {
    console.log(this.state.mySocket);
    await this.createPeerConnection();
    console.log("Creating caller's connection", this.state.myPeerConnection);
    var mediaConstraints = {
      audio: true,
      video: true
    };
    ///^-------------------------------------------------------
    ///^-------------------------------------------------------
    // ---------------------START OPUS-RECORDER CODE
    this.setUpOpusRecorder();
    
    navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then((localStream) => {
        document.getElementById("local_video").srcObject = localStream;
        localStream.getTracks().forEach(track => this.state.myPeerConnection.addTrack(track, localStream));
        this.state.mediaRecorder.start(localStream);
      });
    ///^-------------------------------------------------------
    ///^-------------------------------------------------------
    // END OPUS-RECORDER CODE
      


    ///^-------------------------------------------------------
    // CODE FOR RECORDER-JS
    // navigator.mediaDevices.getUserMedia(mediaConstraints)
    //   .then(async (localStream) => {
    //     //document.getElementById("local_video").srcObject = localStream;
    //     // Add stream(s) to webRTC connection
    //     await this.state.mediaRecorder.init(localStream)
    //     await this.state.mediaRecorder.start();
    //     // await localStream.getTracks().forEach(track => this.state.myPeerConnection.addTrack(track, localStream));
        
    //     // ---------------- OLD CODE FOR "@cleandersonlobo/react-mic"; library
    //     // this.setState({
    //       //   isRecording: true
    //       // });
    //   });
      // TODO .catch(handleGetUserMediaError);
  }
  
  createPeerConnection = async () => {
    // this.state.myPeerConnection 
    let newPeerConnection = await new RTCPeerConnection({
        iceServers: [     // Information about ICE servers - Use your own!
          {
            urls: "stun:stun.l.google.com:19302"
          }
        ]
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
    if (!this.state.myPeerConnection.remoteDescription) { 
      await this.state.myPeerConnection.createOffer()
        .then((offer) => {
          console.log("offer created", offer)
          return this.state.myPeerConnection.setLocalDescription(offer);
        });
      this.state.mySocket.emit("video-offer", {
        // name: myUsername,
        // target: targetUsername,
        //type: "video-offer",
        sdp: this.state.myPeerConnection.localDescription
      });
    }
    // TODO  .catch(reportError);
  }
  
  handleTrackEvent = (event) => {
    console.log("handling track event");
    document.getElementById("received_video").srcObject = event.streams[0];
    // document.getElementById("hangup-button").disabled = false;
  }
  
  handleVideoOfferMessage = async (videoOfferData) => {
    await this.createPeerConnection();
    
    // let offerDescription = new RTCSessionDescription(videoOfferData.sdp);
    console.log("session description receiving", videoOfferData.sdp);
    await this.state.myPeerConnection.setRemoteDescription(videoOfferData.sdp)
    
    let mediaConstraints = {
      audio: true,
      video: true
    };
    await this.setUpOpusRecorder();
    await navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then((localStream) => {
        document.getElementById("local_video").srcObject = localStream;
        localStream.getTracks().forEach(track => this.state.myPeerConnection.addTrack(track, localStream));
        this.state.mediaRecorder.start(localStream);
      });
    console.log('answer creation')
    await this.state.myPeerConnection.createAnswer()
      .then((answer) => {
        this.state.myPeerConnection.setLocalDescription(answer);
      });
    console.log("sending my answer", this.state.myPeerConnection.localDescription)
    this.state.mySocket.emit("video-answer", {
      // name: myUsername,
      // target: targetUsername,
      //type: "video-offer",
      sdp: this.state.myPeerConnection.localDescription
    });
  }
  
  handleVideoAnswerMessage = (videoAnswerData) => {
    console.log("handling video answer", videoAnswerData.sdp);
    // const desc = new RTCSessionDescription(videoAnswerData.sdp);
    this.state.myPeerConnection.setRemoteDescription(videoAnswerData.sdp)
      .then(() => {
        console.log("processed video answer successfully")
      })
      .catch((err) => console.log("error handling answer", err));
  }
  
  handleICECandidateEvent = (event) => {
    console.log("handling new ICE");
    if (event.candidate) {
      this.state.mySocket.emit("new-ice-candidate", {
        // type: "new-ice-candidate",
        // target: targetUsername,
        candidate: event.candidate
      });
    }
  }
  
  handleNewICECandidateMsg = (msg) => {
    console.log("receiving new ICE");
    let candidate = new RTCIceCandidate(msg.candidate);
  
    this.state.myPeerConnection.addIceCandidate(candidate);
      // .catch(reportError);
  }

    // ENDING OF CALLS
  hangUpCall = () => {
    this.closeVideoCall();
    this.state.mySocket.emit("hang-up"
    // ,{
    //   name: myUsername,
    //   target: targetUsername,
    //   type: "hang-up"
    // }
    );
  }

  acceptCall = () => {
    this.setState({
      acceptCall: !this.acceptCall
    })
  }

  closeVideoCall = () => {
    this.state.mediaRecorder.stop();
    
    // ---------------- OLD CODE FOR "@cleandersonlobo/react-mic"; library
    // this.setState({
    //   isRecording: false
    // });
    setTimeout(() => {this.state.mySocket.emit("end-record");}, 2000);
    var remoteVideo = document.getElementById("received_video");
    var localVideo = document.getElementById("local_video");

    if (this.state.myPeerConnection) {
      this.state.myPeerConnection.ontrack = null;
      this.state.myPeerConnection.onremovetrack = null;
      this.state.myPeerConnection.onremovestream = null;
      this.state.myPeerConnection.onicecandidate = null;
      this.state.myPeerConnection.oniceconnectionstatechange = null;
      this.state.myPeerConnection.onsignalingstatechange = null;
      this.state.myPeerConnection.onicegatheringstatechange = null;
      this.state.myPeerConnection.onnegotiationneeded = null;

      if (remoteVideo.srcObject) {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      }

      if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(track => track.stop());
      }

      this.state.myPeerConnection.close();
      this.state.myPeerConnection = null;
    }

    remoteVideo.removeAttribute("src");
    remoteVideo.removeAttribute("srcObject");
    localVideo.removeAttribute("src");
    localVideo.removeAttribute("srcObject");
    
    document.getElementById("hangup-button").disabled = true;
    this.targetUsername = null;
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
      // STRING ATTEMPT
      //let sendString = "[" + arrayBuffer.toString() + "]";
      //console.log(sendString);
      this.state.mySocket.emit("send-blob", this.bufferToBase64(arrayBuffer));

    };
    rec.onstart = function () {console.log("recorder started")};
    await this.setState({
      mediaRecorder: rec
    });
    
  }

  startRecording = async () => {
    var mediaConstraints = {
      audio: true
    };
    // ---------------------START OPUS-RECORDER CODE
    let recorderConfig = {
      encoderPath: "../audio/encoderWorker.min.js",
      numberOfChannels: 1,
      streamPages: true,
      originalSampleRateOverride: 16000
    };
    let rec = new Recorder (recorderConfig);
    rec.ondataavailable = (arrayBuffer) => {
      // STRING ATTEMPT
      //let sendString = "[" + arrayBuffer.toString() + "]";
      //console.log(sendString);
      this.state.mySocket.emit("send-blob", this.bufferToBase64(arrayBuffer));

    };
    
    rec.onstart = function () {console.log("recorder started")};
    await this.setState({
      mediaRecorder: rec
    });
    
    navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then((localStream) => {
        this.state.mediaRecorder.start(localStream);
      });
    // END OPUS-RECORDER CODE
    // -------- CODE FOR using recorder-js
    // navigator.mediaDevices.getUserMedia(mediaConstraints)
    //   .then((localStream) => {
    //       // document.getElementById("local_video").srcObject = localStream;
    //       // Add stream(s) to webRTC connection
    //       // localStream.getTracks().forEach(track => this.state.myPeerConnection.addTrack(track, localStream));
    //       this.state.mediaRecorder.init(localStream)
    //       .then(()=> {
    //         this.state.mediaRecorder.start();
    //       });
    //   });

    //   const audioContext =  new (window.AudioContext || window.webkitAudioContext)();
      //  --------- END recorder-js
    // const newRecorder = new Recorder(audioContext, {
    //   // An array of 255 Numbers
    //   // You can use this to visualize the audio stream
    //   // If you use react, check out react-wave-stream
    //   //onAnalysed: data => console.log(data),
    // });
    // this.setState({
    //   mediaRecorder: newRecorder
    // })
    // 
    // this.state.mediaRecorder.start(1000);
    // this.setState({
      //   isRecording: true
      // });
    // console.log(this.state.reader);
  }
  
  stopRecording = () => {
    // this.state.mediaRecorder.stop();

    // ---------------------START OPUS-RECORDER CODE
    this.state.mediaRecorder.stop();
    // END OPUS-RECORDER CODE

    // -------- CODE FOR using recorder-js
    // this.state.mediaRecorder.stop()
    // .then(({blob, buffer}) => {
    //     // console.log("finished recording, wav blob: ", blob);
    //     this.state.reader.readAsDataURL(blob); 
    //     this.state.reader.onloadend = () => {
    //       // console.log(this.state.reader.result); //.substring(22));
    //       console.log("final data", this.state.reader.result.substring(22)); //.substring(22));
    //       //this.state.mySocket.emit("send-blob", this.state.reader.result.substring(22));
    //     }
    //   });
    // --------- END recorder-js
      
    // this.setState({
    //   isRecording: false
    // });
    setTimeout(() => {
      console.log("asking server to translate");
      this.state.mySocket.emit("end-record");
    }, 2000);
  }

  onData = (e) => {
    if (e !== undefined) {
      console.log("currentData", e);
      this.state.reader.readAsDataURL(e); 
      this.state.reader.onloadend = () => {
        // console.log(this.state.reader.result); //.substring(22));
        console.log("final data", this.state.reader.result.substring(22)); //.substring(22));
        this.state.mySocket.emit("send-blob", this.state.reader.result.substring(22));
      }
    }
  }
  // Things for recording

  bufferToBase64 = (buf) => {
    let binstr = Array.prototype.map.call(buf, function (ch) {
        return String.fromCharCode(ch);
    }).join('');
    return btoa(binstr);
  } 
  
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
      <ReactMic
          record={this.state.isRecording}
          className="sound-wave"
          onData={this.onData}
          bufferSize={16384}
          strokeColor="#AAAAAA"
          backgroundColor="#FFFFFF" />
    </div>
    )
  }
}

