import React, { Component } from 'react'
import { connect } from 'react-redux'
import { signUp } from '../../store/actions/authActions'

class SignUp extends Component {
  state = {
    email: '',
    password: '',
    userName: '',
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
    this.props.signUp(this.state)
  }

  render() {
    return (
      
      <div className="container">
        <form onSubmit={this.handleSubmit} className="white">
          <h5 className="grey-text text-darken-3">Sign up</h5>
          <div className="input-field">
            <label htmlFor='userName'>Username</label>
            <input type="text" id="userName" onChange={this.handleChange}/>
          </div>
          <div className="input-field">
            <label htmlFor='email'>Email</label>
            <input type="email" id="email" onChange={this.handleChange}/>
          </div>
          <div className="input-field">
            <label htmlFor='password'>Password</label>
            <input type="password" id="password" onChange={this.handleChange}/>
          </div>
          <div className="input-field">
            <button className="btn pink lighten-1">Sign up</button>
          </div>
        </form>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    signUp: (credentials) => dispatch(signUp(credentials))
  }
}

export default connect(null, mapDispatchToProps)(SignUp)
