import React, { Component } from 'react'

class SignIn extends Component {
  state = {
    email: '',
    password: ''
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
        </form>
      </div>
    )
  }
}

export default SignIn