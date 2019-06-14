import React, {Component} from 'react'
import { NavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { signOut } from '../../store/actions/authActions'

const SignedInLinks = (props) => {
  return (
    <div>
      <ul className="right">
        <li>{props.profile.userName}</li>
        <li><NavLink to='/transcripts'>Transcripts</NavLink></li>
        <li><NavLink to='/contacts'>Contacts</NavLink></li>
        <li><a onClick={props.signOut}>Log Out</a></li>
        <li><NavLink to='/account' className="btn btn-floating pink lighten-1">IC</NavLink></li>
      </ul>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    signOut: () => dispatch(signOut())
  }
}

export default connect(null, mapDispatchToProps)(SignedInLinks)

// const mapDispatchToProps = dispatch => {
//   return{
//     signOut: () => dispatch(signOut)
//   }
// }

// export default connect(null, mapDispatchToProps)(SignedInLinks)