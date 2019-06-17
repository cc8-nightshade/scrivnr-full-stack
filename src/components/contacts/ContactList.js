import React, { Component } from "react";
import Contact from "./Contact";
import { connect } from "react-redux";
import { compose } from 'react'
import { firestoreConnect } from 'react-redux-firebase'

import {
  getUserInfoByCurrentUser,
  getUsers,
  searchUsers
} from "../../store/actions/usersActions";
import { getContactsByCurrentUser, deleteContact } from "../../store/actions/contactsActions";
import { Redirect } from "react-router-dom";
import AddContact from "./AddContact";
import SearchUsers from "./SearchUsers"


class ContactList extends Component {
  constructor(props) {
    super(props);
    // to show the form when the button is clicked
    this.clickhandler = this.clickhandler.bind(this);
    this.state = {
      showCreateForm: false,
      yolo: true
    };
  }

  componentDidMount() {
    this.props.getUserInfoByCurrentUser();
    this.props.getContactsByCurrentUser();
    this.props.getUsers();

  }
 
  updateState = (event) => {
    setTimeout(() => {
      this.props.getContactsByCurrentUser();
    }, 500)
    //redirects them somewhere
    this.props.history.push('/contacts')
  }

  clickhandler() {
    this.setState({
      showCreateForm: !this.state.showCreateForm
    });
  }

  connectWithThisUser(otherPerson) {
    console.log(otherPerson)
  }

  render() {
    let form;
    if (this.state.showCreateForm) {
      // form = <CreateContact />;
    }
    console.log('Hello from contacts list')
    const { auth, contacts, onlineNow } = this.props;
    if (!auth.uid) {
      return <Redirect to="/signin" />;
    }
    // console.log(firebase.setListener('users'))
    return (
      <div className="contact-list container">
        <div className="online-list">
         {/* {onlineNow} */}
        </div>
        <div className="search-users">
          {/* <SearchUsers></SearchUsers> */}
        </div>
        <div className="user-list">
        {this.state.yolo}
          {/* <AddContact></AddContact> */}
        </div>
        <div>
          CONTACTS ONLINE NOW
          {/* displays all the contacts online now */}
          {contacts &&
            contacts.map((contact, index) => {
              if(onlineNow.includes(contact.email)){
                // if you click the name then it will connect with that user by email
                return (
                  <div key={index}>
                    <div onClick={() => this.connectWithThisUser(contact.email)} 
                    >{contact.firstName} {contact.lastName}: {contact.email} </div>
                    <div onClick={() => {this.props.deleteContact(contact.email, auth.uid);this.updateState()}}>Delete</div>
                  </div>

                )} 
            })}
          <dir>
          CONTACTS OFFLINE 
          {contacts &&
            contacts.map((contact, index) => {
              if(!onlineNow.includes(contact.email)){      
              return (
                <div key={index}>
                  <div>{contact.firstName} {contact.lastName}: {contact.email} </div>
                  <div onClick={() => {this.props.deleteContact(contact.email, auth.uid);this.updateState()}}>Delete</div>
                </div>)} 
            })}
          </dir>
        </div>
        {/* <p>{contacts.uid}</p> */}
        {/* {users &&
          users.map((contact, index) => {
            return <Contact contactInfo={contact} key={index} />;
          })}
        <button className="btn" onClick={this.clickhandler}>
          Add new contact
        </button>
        {form} */}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    users: state.users.users,
    currentUserInfo: state.users.userInfo,
    contacts: state.contacts.contactArray,
    onlineNow: state.users.onlineUsers,
    auth: state.firebase.auth
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getUserInfoByCurrentUser: () => dispatch(getUserInfoByCurrentUser()),
    getContactsByCurrentUser: () => dispatch(getContactsByCurrentUser()),
    getUsers: () => dispatch(getUsers()),
    deleteContact: (searchedEmail, currentUserUid) => dispatch(deleteContact(searchedEmail, currentUserUid))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactList);

// export default compose(
//   firestoreConnect([{ collection: 'users' }]), // or { collection: 'todos' }
//   connect(mapStateToProps,
//       mapDispatchToProps)
// )(ContactList)

