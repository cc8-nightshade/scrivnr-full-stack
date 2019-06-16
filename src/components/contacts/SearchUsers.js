import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { searchUsers } from "../../store/actions/usersActions";
import { addToContacts } from "../../store/actions/contactsActions"

export class SearchUsers extends Component {

  constructor(props){
    super(props);
    this.state = {

    }
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

  render() {
    console.log(this.props)
    const { searchedEmail, currentUserInfo, auth } = this.props
    console.log('search result:' , searchedEmail, auth.email)
    return (
      <div className="">
        <form onSubmit={this.handleSubmit} className="white">
          <div>
            <label htmlFor='number'>Search by Email</label>
            <input type="text" id="searchedEmail" onChange={this.handleChange}/>
          </div>
          <div className="input-field">
            <button type="submit" className="btn">Search</button>
          </div>
        </form>
        { searchedEmail && <div onClick={() => this.props.addToContacts(searchedEmail, auth.uid)} >{searchedEmail[0].userName} {searchedEmail[0].email}</div>} 
      </div>
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
  addToContacts: (searchedEmail, currentUserUid) => dispatch(addToContacts(searchedEmail, currentUserUid))

})

export default connect(mapStateToProps, mapDispatchToProps)(SearchUsers)
