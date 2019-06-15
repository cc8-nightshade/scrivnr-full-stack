import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { searchUsers } from "../../store/actions/usersActions";

export class SearchUsers extends Component {

  constructor(props){
    super(props);
    this.state = {

    }
  }

  componentDidMount(){
    console.log(this.props.searchedEmail)
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    })
  }
  handleSubmit = (event) => {
    console.log('hello submit')
    event.preventDefault()
    console.log(this.props.searchedEmail)
    this.props.searchUsers(this.state)

  }

  render() {
    console.log(this.props)
    const { searchedEmail } = this.props
    console.log('search result:' , searchedEmail)
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
        { searchedEmail && <div>{searchedEmail[0].userName} {searchedEmail[0].email}</div>} 
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  searchedEmail: state.users.searchedEmail
})

const mapDispatchToProps = dispatch => ({
  searchUsers: (inputEmail) => dispatch(searchUsers(inputEmail)),

})

export default connect(mapStateToProps, mapDispatchToProps)(SearchUsers)
