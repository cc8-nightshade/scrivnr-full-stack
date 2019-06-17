import React, { Component } from 'react'

class SignUpV extends Component {
  state = {
    showModal: false,
    signupEmail: '',
    signupPassword: '',
    signupUsername: '',
  }

  handleChange = (event) => {
    console.log(event)
    this.setState({
      [event.target.id]: event.target.value
    })
  }
  handleSubmit = (event) => {
    event.preventDefault()
    console.log(this.state)
  }

  render() {
    return (
      <div id="modal-signup" className="container">
        {/* className="modal" */}
        <div className="modal-content">
        {/* className="modal-content" */}
          <h4>Sign up</h4><br/>
          <form onSubmit={this.handleSubmit} id="signup-form">
            <div className="input-field">
              <input type="text" id="signupUsername" onChange={this.handleChange} required />
              <label htmlFor="signupUsername">Username</label>
            </div>
            <div className="input-field">
              <input type="email" id="signupEmail" onChange={this.handleChange} required />
              <label htmlFor="signupEmail">Email address</label>
            </div>
            <div className="input-field">
              <input type="password" id="signupPassword" onChange={this.handleChange} required />
              <label htmlFor="signupPassword">Password</label>
            </div>
          
            <button className="btn waves-effect waves-light yellow darken-2">Sign up</button>
          </form>
        </div>
      </div>
      
   
    )
  }
}

export default SignUpV