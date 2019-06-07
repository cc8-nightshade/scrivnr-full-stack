import React from 'react'
import { NavLink, Link } from 'react-router-dom'

const SignedInLinks = () => {
  return (
    <div>
     
        <div className="">
          <a href="#" data-target="mobile-demo" className="sidenav-trigger"><i className="material-icons">menu</i></a>
          <ul className="right hide-on-med-and-down">
            <li><NavLink to='/'>Contacts</NavLink></li>
            <li><NavLink to='/about'>Sign Out</NavLink></li>
            <li><NavLink to='/' className='btn btn-floating pink lighten-1'>IC</NavLink></li>
          </ul>
        </div>
      

      <ul className="sidenav" id="mobile-demo">
        <li><NavLink to='/'>Contacts</NavLink></li>
        <li><NavLink to='/about'>Sign Out</NavLink></li>
        <li><NavLink to='/' className='btn btn-floating pink lighten-1'>IC</NavLink></li>
      </ul>
    </div>
    
  )
}

export default SignedInLinks