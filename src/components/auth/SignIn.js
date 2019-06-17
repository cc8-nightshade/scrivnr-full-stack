import React, { Component } from 'react'
import { connect } from 'react-redux'
import { signIn } from '../../store/actions/authActions'
import { Redirect } from 'react-router-dom'

class SignIn extends Component {
  state = {
    email: '',
    password: ''
  }

  componentDidMount(){

  }

    // // Initialize Socket
    // const tempSocket = io.connect();
    // // Initialize Socket Details
    // {
    //   tempSocket.on("message", (messageData) => {
    //     alert(messageData);
    //   });
    //   tempSocket.on("rtc-offer", (callingUser, callingSocket, offerData) => {
    //     console.log("receiving offer", offerData);
    //     if (this.state.myPeerConnection === undefined) {
    //       console.log("Continuing to process processing offer", offerData);
    //       this.handleOfferMessage(callingUser, callingSocket, offerData);
    //     }
    //   });
    //   tempSocket.on("reject-call", (receiverName) => {
    //     alert(`${receiverName} does not exist or rejected your call.`);
    //     this.endCall();
    //   });
    //   tempSocket.on("rtc-answer", (answerData) => {
    //     this.handleAnswerMessage(answerData);
    //   });
    //   tempSocket.on("new-ice-candidate", (iceCandidate) => {
    //     this.handleNewICECandidateMsg(iceCandidate);
    //   });
    //   tempSocket.on("hang-up", () => {
    //     this.endCall();
    //   });
    // }

    // // Store configured socket in state
    // await this.setState({
    //   mySocket: tempSocket
    // });
    // console.log("Initialized client-side socket: ", this.state.mySocket);
    // // talk to socket server to say "I'm online"
    // // this is where get from redux
    // this.state.mySocket.emit("initialize", this.state.myName);



  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    })
  }
  handleSubmit = (event) => {
    event.preventDefault()
    this.props.signIn(this.state)
  
  }

  render() {
    const { authError, auth } = this.props
    if(auth.uid) return <Redirect to='/contacts'></Redirect>
    return (      
      <div className="container">
        <form onSubmit={this.handleSubmit} className="white">
          <h5 className="grey-text text-darken-3">Log in</h5>
          <div className="input-field">
            <label htmlFor='email'>Email</label>
            <input type="email" id="email" onChange={this.handleChange}/>
          </div>
          <div className="input-field">
            <label htmlFor='password'>Password</label>
            <input type="password" id="password" onChange={this.handleChange}/>
          </div>
          <div className="input-field">
            <button className="btn pink lighten-1">Login</button>
          </div>
          <div className="red-text center">
            { authError ? <p>{ authError }</p> : null}
          </div>
        </form>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    authError: state.auth.authError,
    auth: state.firebase.auth
  }
}

const mapDispatchToProps = dispatch => {
  return {
    signIn: (creds) => dispatch(signIn(creds))
  }
}

export default connect(mapStateToProps, mapDispatchToProps )(SignIn)
