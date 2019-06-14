import React from 'react'
import { Link } from 'react-router-dom'
import SignedInLinks from './SignedInLinks'
import { connect } from 'react-redux'
import SignedOutLinks from './SignedOutLinks'
// z-depth-0 remove shadow

const Navbar = (props) => {
  const { auth } = props
  console.log(auth)
  const links = auth.uid ? <SignedInLinks></SignedInLinks> : <SignedOutLinks></SignedOutLinks>

  return (
    <nav className="nav-wrapper teal darken-3 z-depth-0">
      <Link to='/'className="brand-logo">Scrivnr</Link>
      {links}
    </nav>
    
  )
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth
  }
}

export default connect(mapStateToProps)(Navbar)

