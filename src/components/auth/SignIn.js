import React, { Component } from 'react'
import { connect } from 'react-redux'
import { signIn } from '../../store/actions/authActions'
import { Redirect, NavLink } from 'react-router-dom'
import logo from '../../images/our-logo.png'

class SignIn extends Component {
  state = {
    email: '',
    password: ''
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    })
  }
  handleSubmit = (event) => {
    event.preventDefault()
    this.props.signIn(this.state)
    return <Redirect to='/contacts'></Redirect>
  
  }

  render() {
    const { authError, auth } = this.props
    if(auth.uid) return <Redirect to='/contacts'></Redirect>
    return (      

      <div className="container">
        <div className="our-logo">
          <img className="logo-img" src={logo} alt=""/>
        </div>
        <h5 className='slogan'>Don't lie! You said it..</h5>
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
        <div className="sign-up-redirect">
          <p>If you don't have an account sign-up 
            <span><NavLink to='/signup'> here</NavLink></span>
          </p>
        </div>
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
