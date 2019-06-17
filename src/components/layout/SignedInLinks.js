import React from 'react'
import { NavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { signOut } from '../../store/actions/authActions'

const SignedInLinks = (props) => {
  return (
    <div className="signedin">
      <ul className="right">
        {/* <li>{props.profile.firstName}</li> */}
        <li><NavLink to='/transcripts'>Transcripts</NavLink></li>
        {/* <li><NavLink to='/search'>Search for People</NavLink></li> */}
        <li><NavLink to='/contacts'>Contacts</NavLink></li>
        <li><p onClick={props.signOut}>Log Out</p></li>
        {/* <li><NavLink to='/account' className="btn btn-floating pink lighten-1">IC</NavLink></li> */}
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