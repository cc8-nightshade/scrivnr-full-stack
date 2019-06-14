import React from 'react'
import { NavLink, Link } from 'react-router-dom'

const SignedOutLinks = () => {
  return (
  
    <div>
      
        <div className="">
          <a href="#" data-target="mobile-demo" className="sidenav-trigger"><i className="material-icons">menu</i></a>
          <ul className="right hide-on-med-and-down">

            <li><NavLink to='/contacts'>Contacts</NavLink></li>

            <li><NavLink to='/signup'>Sign Up</NavLink></li>
            <li><NavLink to='/signin'>Sign In</NavLink></li>
          </ul>
        </div>
      

      <ul className="sidenav" id="mobile-demo">
        <li><NavLink to='/signup'>Sign Up</NavLink></li>
        <li><NavLink to='/signin'>Sign In</NavLink></li>
      </ul>
    </div>
    
  )
}

export default SignedOutLinks