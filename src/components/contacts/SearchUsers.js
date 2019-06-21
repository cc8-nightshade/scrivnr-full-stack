import React, { Component } from 'react'
import { connect } from 'react-redux'
import { searchUsers } from "../../store/actions/usersActions";
import { addToContacts, deleteContact, getContactsByCurrentUser, addContactsToOtherUser } from "../../store/actions/contactsActions"

export class SearchUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yolo: true
    };
  }
  
  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    })
  }
  handleSubmit = (event) => {
    event.preventDefault()
    this.props.searchUsers(this.state)

  }

  updateState = (event) => {
    setTimeout(() => {
      this.props.getContactsByCurrentUser();
    }, 500);
  }

  render() {
    const { searchedEmail, auth } = this.props
    
    return (
      <div className="">
        <form onSubmit={this.handleSubmit} className="white">
          <div>
            <label htmlFor='number'>Search by Email</label>
            <input type="text" id="searchedEmail" onChange={this.handleChange}/>
          </div>
          {/* <div className="input-field"> */}
            <button type="submit" className="btn buttons">Search</button>
          {/* </div> */}
        </form>
        { searchedEmail &&
          <ul className="collection">
            <li className="collection-item"  >{searchedEmail[0].firstName} {searchedEmail[0].email}
            <i onClick={() => {this.props.addToContacts(searchedEmail, auth.uid);this.props.addContactsToOtherUser(searchedEmail, auth.uid); this.updateState()}} className="secondary-content material-icons">person_add</i>
            </li>
            {/* <div onClick={() => this.props.deleteContact(searchedEmail[0].email, auth.uid)} >Delete</div> */}
          </ul>
        } 
        </div>
      // <div>
      //   <div onClick={() => this.props.deleteContact(searchedEmail, auth.uid)} >Delete</div>
      // </div>
    )
  }
}
// onClick={() => addToContacts(searchedEmail, auth.email)}

const mapStateToProps = (state) => ({
  searchedEmail: state.users.searchedEmail,
  auth: state.firebase.auth,

  // currentUserInfo: state.users.userInfo[0]

})

const mapDispatchToProps = dispatch => ({
  searchUsers: (inputEmail) => dispatch(searchUsers(inputEmail)),
  addToContacts: (searchedEmail, currentUserUid) => dispatch(addToContacts(searchedEmail, currentUserUid)),
  addContactsToOtherUser: (searchedEmail, currentUserUid) => dispatch(addContactsToOtherUser(searchedEmail, currentUserUid)),
  deleteContact: (searchedEmail, currentUserUid) => dispatch(deleteContact(searchedEmail, currentUserUid)),
  getContactsByCurrentUser: () => dispatch(getContactsByCurrentUser()),


})

export default connect(mapStateToProps, mapDispatchToProps)(SearchUsers)
