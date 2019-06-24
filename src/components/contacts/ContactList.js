import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getUserInfoByCurrentUser,
  getUsers,
  getOnlineUsers,
} from "../../store/actions/usersActions";
import {
  getContactsByCurrentUser,
  deleteContact
} from "../../store/actions/contactsActions";
import { updateCallingStatus, getCallingStatus } from '../../store/actions/callerActions'
import { Redirect } from "react-router-dom";
import SearchUsers from "./SearchUsers";
import io from "socket.io-client";
import Recorder from "opus-recorder";
import { exportDefaultSpecifier } from "@babel/types";
import phone from '../../images/phone.gif'

class ContactList extends Component {
  constructor(props) {
    super(props);
    // to show the form when the button is clicked
    this.clickhandler = this.clickhandler.bind(this);
    this.state = {
      showCreateForm: false,
      yolo: true,
      mySocket: undefined,
      myPeerConnection: undefined,
      mediaRecorder: undefined,
      receiverName: null
    };
  }

  componentDidMount() {
    this.props.getUserInfoByCurrentUser();
    this.props.getContactsByCurrentUser();
    this.props.getUsers();
    this.props.getCallingStatus();
    this.sendUserInfoToServer();

  }

  updateState = event => {
    setTimeout(() => {
      this.props.getContactsByCurrentUser();
    }, 500);
    //redirects them somewhere
    this.props.history.push("/contacts");
  };

  clickhandler() {
    this.setState({
      showCreateForm: !this.state.showCreateForm
    });
  }

  sendUserInfoToServer = async () => {
    // Initialize Socket
    const tempSocket = io.connect();
    // Initialize Socket Details
    {
      tempSocket.on("message", messageData => {
        alert(messageData);
      });
      tempSocket.on("online-users", onlineNow => {
        // Get List From Ian
        this.props.getOnlineUsers(onlineNow)
      });
      tempSocket.on("calling", (callingUser, callingSocket) => {
        this.props.updateCallingStatus('beingCalled')
        this.checkAcceptCall(callingUser, callingSocket);
      });



      tempSocket.on("rtc-offer", (callingUser, callingSocket, offerData) => {
        this.props.updateCallingStatus('inCall')
        console.log("receiving offer", offerData);
        if (this.state.myPeerConnection === undefined) {
          console.log("Continuing to process processing offer", offerData);
          this.handleOfferMessage(callingUser, callingSocket, offerData);
        }
      });
      tempSocket.on("reject-call", receiverName => {
        this.props.updateCallingStatus('notInCall')
        alert(`${receiverName} does not exist or rejected your call.`);
        this.endCall();
      });
      tempSocket.on("rtc-answer", answerData => {
        this.props.updateCallingStatus('inCall')
        this.handleAnswerMessage(answerData);
      });
      tempSocket.on("new-ice-candidate", iceCandidate => {
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
    // this is where get from redux

    this.state.mySocket.emit("initialize", this.props.auth.email);
    this.state.mySocket.emit("get-online-users");

  };

  checkAcceptCall = (callingUser, callingSocket) => {
    if (
      window.confirm(`Would you like to accept a call from ${callingUser}?`)
    ) {
      console.log("Accepting call");
      this.state.mySocket.emit("accept-call", callingUser, callingSocket);
    } else {
      // If the user rejects call
      console.log("Rejecting call");
      this.state.mySocket.emit(
        "reject-call",
        this.props.auth.email,
        callingSocket
      );
      // TODO Destroy recorder!
    }
  }

  startCall = async receiverName => {
    this.props.updateCallingStatus('calling')

    // const receiverName = prompt('Who do you want to call?', 'Voldemort');
    console.log(receiverName);
    if (receiverName !== "" && receiverName !== null) {
      console.log("Starting a call");
      this.setState({
        receiverName
      });

      
      this.createPeerConnection();
      console.log("Created caller's connection", this.state.myPeerConnection);
      
      await this.setUpOpusRecorder();

      console.log("Created recorder");

      const mediaConstraints = {
        audio: true
        // video: true
      };

      navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then((localStream) => {
          //document.getElementById("local_video").srcObject = localStream;
          localStream.getTracks().forEach(track => this.state.myPeerConnection.addTrack(track, localStream));
          this.state.mediaRecorder.start(localStream);
          // this.setState({
          //   myStream: localStream
          // });

          console.log("Tracks added to connection");
        });
    } else {
      // If they didn't enter any name
      alert("Please enter a user name");
    }
  };

  createPeerConnection = async () => {
    let newPeerConnection = await new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
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
  };

  handleNegotiationNeededEvent = async () => {
    // this outer "if" will stop the callee from creating their own offer automatically when they mount their streams
    if (
      !this.state.myPeerConnection.remoteDescription &&
      !this.state.myPeerConnection.localDescreption
    ) {
      await this.state.myPeerConnection.createOffer().then(offer => {
        this.state.myPeerConnection.setLocalDescription(offer);
        console.log("Offer created, sending to server:", offer);
      });
      this.state.mySocket.emit(
        "rtc-offer",
        this.props.auth.email,
        this.state.receiverName,
        {
          sdp: this.state.myPeerConnection.localDescription
        }
      );
    }
    // TODO  .catch(reportError);
  };

  handleTrackEvent = event => {
    console.log("Handling track event (incoming answer)");
    console.log("These are the streams received", event.streams);
    document.getElementById("received_video").srcObject = event.streams[0];
  };

  handleOfferMessage = async (callerName, callerSocket, offerData) => {
    // Check to see if they accept, and only continue setting up connection if yes
    console.log("session description receiving", offerData.sdp);

    // confirmation moved to different place
    // if (window.confirm(`Would you like to accept a call from ${callerName}?`)) {


      await this.createPeerConnection();
      await this.state.myPeerConnection.setRemoteDescription(offerData.sdp);
      await this.setUpOpusRecorder();

      let mediaConstraints = {
        audio: true
        // video: true
      };
      await navigator.mediaDevices
        .getUserMedia(mediaConstraints)
        .then(localStream => {
          document.getElementById("local_video").srcObject = localStream;
          localStream
            .getTracks()
            .forEach(track =>
              this.state.myPeerConnection.addTrack(track, localStream)
            );
          this.state.mediaRecorder.start(localStream);
        });
      await this.state.myPeerConnection.createAnswer().then(answer => {
        this.state.myPeerConnection.setLocalDescription(answer);
      });
      console.log(
        "Answer created and sending:",
        this.state.myPeerConnection.localDescription
      );
      this.state.mySocket.emit("rtc-answer", callerSocket, {
        sdp: this.state.myPeerConnection.localDescription
      });
    // } else {
    //   // If the user rejects call
    //   this.state.mySocket.emit(
    //     "reject-call",
    //     this.props.auth.email,
    //     callerSocket
    //   );
    
      // Confirmation logic moved elsewhere
    // } 
    // else { // If the user rejects call
    //   this.state.mySocket.emit("reject-call", this.state.myName, callerSocket);
    //   this.resetMyPeerConnection();
    //   // TODO Destroy recorder!
    // }
  }
  
  handleAnswerMessage = async (answerData) => {
    // const mediaConstraints = {audio: true, 
    //   // // video: true
    // };
    // navigator.mediaDevices.getUserMedia(mediaConstraints)
    //   .then((localStream) => {
    //     this.state.mediaRecorder.start(localStream);
    //     console.log("Started Recording");
    //   });
    
    
    //this.state.mySocket.emit("reset-recording");
    console.log("handling answer", answerData.sdp);
    
    // REALLY ONLY WANT TO START RECORDING ON ANSWER, BUT NOT WORKING???
    // this.state.mediaRecorder.start(this.state.myStream);
    
    console.log("started caller's recording");
    this.state.myPeerConnection.setRemoteDescription(answerData.sdp)

      .then(() => {
        console.log("processed answer successfully");
      })
      .catch(err => console.log("error handling answer", err));
  };

  handleICECandidateEvent = event => {
    console.log("sending new ICE candidate");
    if (event.candidate) {
      this.state.mySocket.emit("new-ice-candidate", {
        candidate: event.candidate
      });
    }
  };

  handleNewICECandidateMsg = msg => {
    console.log("receiving and processing new ICE candidate");
    const candidate = new RTCIceCandidate(msg.candidate);
    this.state.myPeerConnection.addIceCandidate(candidate);
    // TODO .catch(reportError);
  };

  // ENDING OF CALLS
  hangUpCall = () => {
    console.log("Hanging up call");
    this.state.mySocket.emit("hang-up");
    this.endCall();
  };

  // Refactored out of hangUpCall because it needs to be run when the other party hangs up
  endCall = () => {
    console.log("Shutting down call.");
    this.props.updateCallingStatus('notInCall')
    if (this.state.mediaRecorder) {
      this.state.mediaRecorder.stop();

      setTimeout(() => {this.state.mySocket.emit("end-recording");}, 2000);

    }
    this.resetMyPeerConnection();
    this.setState({
      mediaRecorder: null
    });
    // TODO - Change color of buttons etc based on call status
  };

  setUpOpusRecorder = async () => {
    let recorderConfig = {
      encoderPath: "../audio/encoderWorker.min.js",
      numberOfChannels: 1,
      streamPages: true,
      originalSampleRateOverride: 48000
    };
    let rec = new Recorder(recorderConfig);
    rec.ondataavailable = arrayBuffer => {
      this.state.mySocket.emit("send-blob", this.bufferToBase64(arrayBuffer));
    };
    rec.onstart = () => {
      console.log("recorder started");
    };
    await this.setState({
      mediaRecorder: rec
    });
  };

  // Utility for setUpOpusRecorder to change buffer to base64

  bufferToBase64 = (buf) => {
    let binstr = Array.prototype.map.call(buf, function (ch) {
        return String.fromCharCode(ch);
    }).join('');

    return btoa(binstr);
  };

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
  };

  bookmarkBtn(currentUserEmail) {
    console.log(currentUserEmail)
    this.state.mySocket.emit("bookmark");
  }

  render() {
    let form;
    if (this.state.showCreateForm) {
      // form = <CreateContact />;
    }
    const { auth, contacts, onlineNow, status } = this.props;
    console.log(status)
    if (!auth.uid) {
      return <Redirect to="/signin" />;
    }
    let buttons;
    if (status == "notInCall") {
      buttons = (
        <div className=""></div> 
      )
    } else if( status == 'calling'){
      buttons = (
        <div className="">
          <img src={phone} alt="phone"/>
        </div>
      )
    } else if( status == 'calling-receiving'){
      buttons = (
        <div className="">
          <img src={phone} alt="phone"/>
        </div>
      )

    } else if( status == "beingCalled") {
      buttons = (
        // BUTTONS START
        <div className="">
          <div className="image-wrapper">
            <img src={phone} alt="phone"/>
          </div>
          <div className="button-wrapper">
            <button id="answer-button" className="btn buttons hangup waves-effect waves-light" onClick={this.hangUpCall}>
              Answer
            </button>
            <button id="hangup-button" className="btn buttons hangup waves-effect waves-light" onClick={this.hangUpCall}>
              Hang Up
            </button>
            <button id="hangup-button" className="btn buttons hangup waves-effect waves-light" onClick={() => this.bookmarkBtn(this.props.auth.email)}>
              Bookmark
            </button>
          </div>
          <div className="camera-box">
            <video id="received_video" autoPlay />
            <video id="local_video" autoPlay muted />
          </div>
        </div>
      // BUTTONS END 
      )
    } else if( status == "inCall") {
      buttons = (
        // BUTTONS START
        <div className="button-video-items">
          <div className="camera-box">
            <video id="received_video" autoPlay />
            <video id="local_video" autoPlay muted />
          </div>
          <div className="image-wrapper">
            <img src={phone} alt="phone"/>
          </div>
          <div className="button-wrapper">
            <button id="hangup-button" className="btn buttons hangup waves-effect waves-light" onClick={this.hangUpCall}>
              Hang Up
            </button>
            <button id="hangup-button" className="btn buttons hangup waves-effect waves-light" onClick={() => this.bookmarkBtn(this.props.auth.email)}>
              Bookmark
            </button>
          </div>
        </div>
      // BUTTONS END 
      )
    }


    return (
      <div className="contact-video container">
         
        {/* CONTACTS START */}
        <div className="contact-list">
          <h6 className="user-header">Logged in as: {this.props.profile.firstName}</h6>
          <div className="search-users">
            <SearchUsers />
          </div>

          <div>
            <ul className="collection with-header">
              <li className="collection-header">
                <h5>Online Now</h5>
              </li>
              {contacts &&
                contacts.map((contact, index) => {
                  if (onlineNow.includes(contact.email)) {
                    // if you click the name then it will connect with that user by email
                    return (
                      <li key={index} className="collection-item">
                        {contact.firstName} {contact.lastName}
                        <i className="secondary-content material-icons buttons"
                            onClick={() => this.startCall(contact.email)}>
                          call
                        </i>
                        <i className="secondary-content material-icons buttons"
                            onClick={() => {
                            this.props.deleteContact(contact.email, auth.uid);
                            this.updateState();
                          }}>delete
                        </i>
                      </li>
                    );
                  }
                })}
            </ul>

            <ul className="collection with-header">
              <li className="collection-header">
                <h5>Offline</h5>
              </li>
              {contacts &&
                contacts.map((contact, index) => {
                  if (!onlineNow.includes(contact.email)) {
                    return (
                    <li key={index} className="collection-item">
                      {contact.firstName} {contact.lastName}
                      <i className="secondary-content material-icons buttons">
                        not_interested
                      </i>
                      <i className="secondary-content material-icons buttons"
                        onClick={() => {
                        this.props.deleteContact(contact, auth.uid);
                        this.updateState();}}>delete
                      </i>
                    </li>
                    );
                  }
                })}
            </ul>
          </div>
        </div>
        {/* CONTACTS ENDS */}
        <div className="button-call-wrapper">
          { buttons }
        </div>

      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    status: state.callerStatus.status,
    users: state.users.users,
    currentUserInfo: state.users.userInfo,
    contacts: state.contacts.contactArray,
    onlineNow: state.users.onlineNow,
    auth: state.firebase.auth,
    profile: state.firebase.profile
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getUserInfoByCurrentUser: () => dispatch(getUserInfoByCurrentUser()),
    getContactsByCurrentUser: () => dispatch(getContactsByCurrentUser()),
    getUsers: () => dispatch(getUsers()),
    getOnlineUsers: onlineUsers => dispatch(getOnlineUsers(onlineUsers)),
    deleteContact: (searchedEmail, currentUserUid) =>
    dispatch(deleteContact(searchedEmail, currentUserUid)),
    getCallingStatus: () => dispatch(getCallingStatus()),
    updateCallingStatus: (status) => dispatch(updateCallingStatus(status))
  };
};

// 'notInCall', 'calling' -... repeating, 'beingCalled' - hangup+bookmarks, answer button,  'inCall' - hangup+bookmarks

// disabling call buttons

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactList);

// export default compose(
//   firestoreConnect([{ collection: 'users' }]), // or { collection: 'todos' }
//   connect(mapStateToProps,
//       mapDispatchToProps)
// )(ContactList)
