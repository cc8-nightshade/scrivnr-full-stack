import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { searchUsers } from "../../store/actions/usersActions";

export class SearchUsers extends Component {

  state = {
    
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    })
  }
  handleSubmit = (event) => {
    console.log('hello submit')
    event.preventDefault()
    console.log(this.state)
    this.props.searchUsers(this.state)

  }

  render() {
    const { searchedUser } = this.props
    console.log('serch user:' , searchedUser)
    return (
      <div className="">
        <form onSubmit={this.handleSubmit} className="white">
          <div>
            <label htmlFor='number'>Search by Email</label>
            <input type="text" id="searched-email" onChange={this.handleChange}/>
          </div>
          <div className="input-field">
            <button type="submit" className="btn">Search</button>
          </div>
        </form>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  searchedUser: state.users.searchedUser
})

const mapDispatchToProps = dispatch => ({
  searchUsers: (inputEmail) => dispatch(searchUsers(inputEmail)),

})

export default connect(mapStateToProps, mapDispatchToProps)(SearchUsers)
