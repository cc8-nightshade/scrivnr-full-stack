import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar'
import Dashboard from './components/dashboard/Dashboard'
// import ContactList from './components/contacts/ContactList'
import ContactDetails from './components/contacts/ContactDetails'
import Video from './components/dashboard/Video'
import './App.css'



class App extends Component {
  render () {
    return (
      <BrowserRouter>
        <div className="App">
          <Navbar></Navbar>
          {/* <Dashboard></Dashboard> */}
          <Video></Video>
          {/* <Switch> */}
            {/* <Route path='/about' component={Dashboard}></Route> */}
            {/* <Route path='/contact/:id' component={ContactDetails}></Route> */}
            {/* <Route path='/' component={Video}></Route> */}
          {/* </Switch> */}
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
