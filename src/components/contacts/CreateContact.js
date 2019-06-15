import React, { Component } from 'react'
import { connect } from "react-redux";
import { createContact } from "../../store/actions/contactsActions"

class CreateContact extends Component { 
  state = {
    
  }

  handleChange = (event) => {
    console.log(event)
    this.setState({
      [event.target.id]: event.target.value
    })
  }
  handleSubmit = (event) => {
    console.log('hello submit')
    event.preventDefault()
    console.log(this.state)
    this.props.createContact(this.state)

  }

  render() {
    return (
      <div className="">
        <form onSubmit={this.handleSubmit} className="white">
          <h5 className="grey-text text-darken-3">Create new contact</h5>
          <div className="input-field">
            <label htmlFor='firstName'>First name</label>
            <input type="text" id="firstName" onChange={this.handleChange}/>
          </div>
          <div className="input-field">
            <label htmlFor='lastName'>Last name</label>
            <input type="text" id="lastName" onChange={this.handleChange}/>
          </div>
          <div className="input-field">
            <label htmlFor='number'>Number</label>
            <input type="text" id="number" onChange={this.handleChange}/>
          </div>
          <div className="input-field">
            <button type="submit" className="btn pink lighten-1">Add contact</button>
          </div>
        </form>
      </div>
    )
  }
}



const mapDispatchToProps = (dispatch) => {
  return {
    createContact: (contact) => dispatch(createContact(contact))
  }
}

export default connect(null, mapDispatchToProps)(CreateContact)
// export default compose(
//   connect(mapStateToProps, mapDispatchToProps),
//   firestoreConnect(),
// )(CreateContact)