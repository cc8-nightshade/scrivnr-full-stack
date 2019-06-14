import React, { Component } from "react";
import Contact from "./Contact";
import CreateContact from "./CreateContact";
import { connect } from "react-redux";
import { getUserInfoByCurrentUser, getUsers } from "../../store/actions/usersActions"
import { Redirect } from "react-router-dom"



// "redux-firestore": "^1.0.0-alpha.2",

class ContactList extends Component {
  constructor(props) {
    super(props);
    this.clickhandler = this.clickhandler.bind(this);
    this.state = {
      showCreateFrom: false
    };
  }

  componentDidMount(){
    this.props.getUserInfoByCurrentUser()
    this.props.getUsers()
  }

  clickhandler() {
    this.setState({
      showCreateFrom: !this.state.showCreateFrom
    });
  }

  render() {
    let form;
    if (this.state.showCreateFrom) {
      form = <CreateContact />;
    }

    const { users, auth, currentUserInfo, contacts } = this.props;
    console.log('userInfo: ', currentUserInfo,'contacts: ', contacts )
    if(!auth.uid){
      return <Redirect to='/signin'></Redirect>
    }
    return (
      <div>

        {/* <div>
          {contacts.contacts && contacts.contacts.map((contact, index) => {
              return <div> {contact}</div>;
            })}
        </div> */}
        <div className="contact-list container">
        {/* <p>{contacts.uid}</p> */}
          {users &&
            users.map((contact, index) => {
              return <Contact contactInfo={contact} key={index} />;
            })}
          <button className="btn" onClick={this.clickhandler}>
            Add new contact
          </button>
          {form}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  // console.log('contactList props:', state)
  return {
    users: state.users.users,
    currentUserInfo: state.users.userInfo,
    contacts: state.users.userInfo,
    auth: state.firebase.auth
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getUserInfoByCurrentUser: () => dispatch(getUserInfoByCurrentUser()),
    getUsers: () => dispatch(getUsers())
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(ContactList);
// export default compose(
//   connect( mapStateToProps),
//   firestoreConnect([
//     { collection: 'contacts' }
//   ]),
// )(ContactList)
