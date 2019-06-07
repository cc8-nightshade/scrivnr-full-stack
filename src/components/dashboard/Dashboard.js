import React, { Component } from 'react';
import ContactList from '../contacts/ContactList'


class Dashboard extends Component {
  render () {
    console.log(this.props.match.params.id)
    return (
      <div className="dashboard container">
        <div className="row">
          <div className="col s12 m6">
            <ContactList></ContactList>
          </div>
          <div className="col s12 m6 offset-s1 offset-m1">
            YOLO
          </div>
          <div className="col s12 m6 offset-s1 offset-m1">
            YOLO
          </div>
        </div>
      </div>
    )
  }
}

export default Dashboard