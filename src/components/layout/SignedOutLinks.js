import React from 'react'
import { NavLink, Link } from 'react-router-dom'

const SignedOutLinks = () => {
  return (
  
    <div>
      
        <div className="">
          <a href="#" data-target="mobile-demo" className="sidenav-trigger"><i className="material-icons">menu</i></a>
          <ul className="right hide-on-med-and-down">
            <li><NavLink to='/about'>About</NavLink></li>
            <li><NavLink to='/about'>Sign Up</NavLink></li>
            <li><NavLink to='/about'>Sign In</NavLink></li>
          </ul>
        </div>
      

      <ul className="sidenav" id="mobile-demo">
        <li><NavLink to='/about'>About</NavLink></li>
        <li><NavLink to='/about'>Sign Up</NavLink></li>
        <li><NavLink to='/about'>Sign In</NavLink></li>
      </ul>
    </div>
    
  )
}

export default SignedOutLinks