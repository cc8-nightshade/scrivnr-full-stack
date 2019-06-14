import React, {Component} from 'react'
import { NavLink } from 'react-router-dom'


class SignedInLinks extends Component {

  componentDidMount(){
   
  };
  

  render (){
    return (
      <div>
        <nav>
          <a href="#" data-target="mobile-demo" className="sidenav-trigger"><i className="material-icons">menu</i></a>
          <ul className="right hide-on-med-and-down">
            <li><NavLink to='/contacts'>Contacts</NavLink></li>
            <li><NavLink to='/dialogues'>Dialogues</NavLink></li>
            <li><NavLink to='/transcripts'>Transcripts</NavLink></li>
            <li><NavLink to='/logout'>Log Out</NavLink></li>
            <li><NavLink to='/' className='btn btn-floating pink lighten-1'>IC</NavLink></li>
          </ul>

        </nav>
        
  
        <ul className="sidenav" id="mobile-demo">
          <li><NavLink to='/contacts'>Contacts</NavLink></li>
          <li><NavLink to='/transcripts'>Transcripts</NavLink></li>
          <li><NavLink to='/logout'>Log Out</NavLink></li>
          <li><NavLink to='/' className='btn btn-floating pink lighten-1'>IC</NavLink></li>
        </ul>
      </div>
      
    )


  }
}

export default SignedInLinks