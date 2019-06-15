import React from 'react'
import { Link } from 'react-router-dom'
import SignedInLinks from './SignedInLinks'
import { connect } from 'react-redux'
import SignedOutLinks from './SignedOutLinks'
// z-depth-0 remove shadow

const Navbar = (props) => {
  const { auth, profile } = props
  // console.log('current user: ', auth)
  const links = auth.uid ? <SignedInLinks profile={profile}></SignedInLinks> : <SignedOutLinks></SignedOutLinks>

  return (
    <nav className="nav-wrapper teal darken-3 z-depth-0">
      <Link to='/'className="brand-logo">Scrivnr</Link>
      {links}
    </nav>
    
  )
}

const mapStateToProps = state => {
  // console.log('state: ', state)
  return {
    auth: state.firebase.auth,
    profile: state.firebase.profile
  }
}

export default connect(mapStateToProps)(Navbar)

