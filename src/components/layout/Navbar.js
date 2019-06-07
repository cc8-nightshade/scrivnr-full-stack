import React from 'react'
import { Link } from 'react-router-dom'
import SignedInLinks from './SignedInLinks'
// import SignedOutLinks from './SignedOutLinks'
// z-depth-0 remove shadow
const Navbar = () => {
  return (
    <nav className="nav-wrapper teal darken-3 z-depth-0">
      <Link to='/about'className="brand-logo">Scrivnr</Link>
      {/* <div className="container"> */}
        {/* <Link to='/' className="brand-logo">Scrivnr</Link> */}
        <SignedInLinks></SignedInLinks>
        {/* <SignedOutLinks></SignedOutLinks> */}
      {/* </div> */}
    </nav>
    
  )
}

export default Navbar

{/* <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <a class="navbar-brand" href="/">PITANIC</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
  
    <div class="collapse navbar-collapse" id="navbarColor01">
      <ul class="navbar-nav ml-auto">
        <li class="nav-item active">
          <a class="nav-link" href="/">Home <span class="sr-only">(current)</span></a>
        </li>
        <li class="nav-item active">
          <a class="nav-link" href="/titanic">Titanic</a>
        </li>
        <!-- <li class="nav-item active">
          <a class="nav-link" href="/articles">Articles</a>
        </li> -->
        <li class="nav-item active">
          <a class="nav-link" href="/form">Let's go!</a>
        </li>
      </ul>
      <!-- <form class="form-inline my-2 my-lg-0">
        <input class="form-control mr-sm-2" type="text" placeholder="Search">
        <button class="btn btn-secondary my-2 my-sm-0" type="submit">Search</button>
      </form> -->
    </div>
  </nav> */}