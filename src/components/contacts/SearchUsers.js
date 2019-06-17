import React, { Component } from 'react'
import { connect } from 'react-redux'
import { searchUsers } from "../../store/actions/usersActions";
import { addToContacts, deleteContact } from "../../store/actions/contactsActions"

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
    this.setState({
      yolo: !this.state.yolo
    })
    console.log(this.state.yolo)
  }

  render() {
    const { searchedEmail, auth } = this.props
    return (
      <div className="container">
        <form onSubmit={this.handleSubmit} className="white">
          <div>
            <label htmlFor='number'>Search by Email</label>
            <input type="text" id="searchedEmail" onChange={this.handleChange}/>
          </div>
          <div className="input-field">
            <button type="submit" className="btn">Search</button>
          </div>
        </form>
        { searchedEmail &&
          <div>
            <div onClick={() => {this.props.addToContacts(searchedEmail, auth.uid); this.updateState()}} >{searchedEmail[0].userName} {searchedEmail[0].email}
            </div>
            <div onClick={() => this.props.deleteContact(searchedEmail[0].email, auth.uid)} >Delete</div>
          </div>
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
  deleteContact: (searchedEmail, currentUserUid) => dispatch(deleteContact(searchedEmail, currentUserUid))

})

export default connect(mapStateToProps, mapDispatchToProps)(SearchUsers)
