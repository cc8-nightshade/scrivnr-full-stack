import React, { Component } from 'react'
import io from 'socket.io-client'
// import socketIOClient from 'socket.io-client'


export default class Video extends Component {
  constructor(props) {
    super(props)

    this.state = {
      mySocket: '',
      myPeerConnection: undefined,
      acceptCall: false
    
    }
  }

  componentDidMount(){
    document.addEventListener("loadend", this.initialConnect());
    // this.initialConnect()
  }


  initialConnect = async () => {
    // alert("tesitng123");
    // this.state.mySocket = io.connect('https://192.168.10.81:9000/');
    const tempSocket = io.connect();
    
    // this.setState({
    //   mySocket: tempSocket
    // })
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
    console.log(tempSocket)
    console.log(this.state.mySocket);
    await this.setState({
      mySocket: tempSocket
    });
    console.log(this.state.mySocket);
    this.state.mySocket.emit("initialize");
  }

  startCall = () => {
    console.log(this.state.mySocket);
    this.createPeerConnection();
    console.log("Creating caller's connection", this.state.myPeerConnection);
    var mediaConstraints = {
      audio: {
        echoCancellation: {exact: true}
      },
      // audio: true// We want an audio track
      //,
      video: true // ...and we want a video track
    };
    navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then((localStream) => {
        document.getElementById("local_video").srcObject = localStream;
        localStream.getTracks().forEach(track => this.state.myPeerConnection.addTrack(track, localStream));
      });
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

    await this.setState({
      myPeerConnection: newPeerConnection
    })
  
    this.state.myPeerConnection.onicecandidate = this.handleICECandidateEvent;
    this.state.myPeerConnection.ontrack = this.handleTrackEvent;
    this.state.myPeerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent;
    // Other Things that could be implemented for 
    // state.myPeerConnection.onremovetrack = handleRemoveTrackEvent;
    // state.myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    // state.myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    // state.myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
  }
  
  handleNegotiationNeededEvent = () => {
    // this outer "if" will stop the callee from creating their own offer automatically when they mount their streams
    if (!this.state.myPeerConnection.remoteDescription) { 
      this.state.myPeerConnection.createOffer().then((offer) => {
        console.log("this is the offer", offer)
        return this.state.myPeerConnection.setLocalDescription(offer);
      })
      .then(()  => {
        this.state.mySocket.emit("video-offer", {
          // name: myUsername,
          // target: targetUsername,
          //type: "video-offer",
          sdp: this.state.myPeerConnection.localDescription
        });
      });
    }
    // TODO  .catch(reportError);
  }
  
  handleTrackEvent = (event) => {
    document.getElementById("received_video").srcObject = event.streams[0];
    // document.getElementById("hangup-button").disabled = false;
  }
  
  handleVideoOfferMessage = async (videoOfferData) => {
   

    await this.createPeerConnection();
    
    let offerDescription = new RTCSessionDescription(videoOfferData.sdp);
    console.log("session description receiving", offerDescription);
    this.state.myPeerConnection.setRemoteDescription(offerDescription)
      .then(() => {
        var mediaConstraints = {
          audio: {
            echoCancellation: {exact: true}
          },
          //audio: true // We want an audio track
          //, 
          video: true // ...and we want a video track
        };
        return navigator.mediaDevices.getUserMedia(mediaConstraints);
      })
      .then((stream) => {
        let localStream = stream;  
        document.getElementById("local_video").srcObject = localStream;
          localStream.getTracks().forEach((track) => this.state.myPeerConnection.addTrack(track, localStream));
        })
      .then(() => {
        console.log('answer created')
        return this.state.myPeerConnection.createAnswer();
      })
      .then((answer) => {
        console.log('description set')
        return this.state.myPeerConnection.setLocalDescription(answer);
      })
      .then(()=>{
        console.log("sending my answer", this.state.myPeerConnection.localDescription)
        this.state.mySocket.emit("video-answer", {
          // name: myUsername,
          // target: targetUsername,
          //type: "video-offer",
          sdp: this.state.myPeerConnection.localDescription
        });
      });
    
  }
  
  handleVideoAnswerMessage = (videoAnswerData) => {
    console.log("handling video answer", videoAnswerData);
    const desc = new RTCSessionDescription(videoAnswerData.sdp);
    this.state.myPeerConnection.setRemoteDescription(desc)
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
    var candidate = new RTCIceCandidate(msg.candidate);
  
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
      </div>
    </div>
    )
  }
}
