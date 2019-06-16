import React, { Component } from "react";
import Contact from "./Contact";
import CreateContact from "./CreateContact";
import { connect } from "react-redux";
import {
  getUserInfoByCurrentUser,
  getUsers,
  searchUsers
} from "../../store/actions/usersActions";
import { getContactsByCurrentUser } from "../../store/actions/contactsActions";
import { Redirect } from "react-router-dom";
import AddContact from "./AddContact";
import SearchUsers from "./SearchUsers"


class ContactList extends Component {
  constructor(props) {
    super(props);
    // to show the form when the button is clicked
    this.clickhandler = this.clickhandler.bind(this);
    this.state = {
      showCreateFrom: false
    };
  }

  componentDidMount() {
    this.props.getUserInfoByCurrentUser();
    this.props.getContactsByCurrentUser();
    this.props.getUsers();
  }

  clickhandler() {
    this.setState({
      showCreateFrom: !this.state.showCreateFrom
    });
  }

  connectWithThisUser(otherPerson) {
    console.log(otherPerson)
  }

  render() {
    let form;
    if (this.state.showCreateFrom) {
      form = <CreateContact />;
    }

    const { users, auth, contacts, onlineNow } = this.props;

    if (!auth.uid) {
      return <Redirect to="/signin" />;
    }

    return (
      <div className="contact-list container">
        <div className="online-list">
         {/* {onlineNow} */}
        </div>
        <div className="search-users">
          <SearchUsers></SearchUsers>
        </div>
        <div className="user-list">
          {/* <AddContact></AddContact> */}
        </div>
        <div>
          CONTACTS ONLINE NOW
          {/* displays all the contacts online now */}
          {contacts &&
            contacts.map((contact, index) => {
              if(onlineNow.includes(contact.email)){
                // if you click the name then it will connect with that user by email
                return <div onClick={() => this.connectWithThisUser(contact.email)} 
                key={index}>{contact.firstName} {contact.lastName}: {contact.email} </div>;
              }
            })}
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactList);

