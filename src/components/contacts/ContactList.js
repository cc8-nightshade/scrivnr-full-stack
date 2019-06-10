import React, { Component } from "react";
import Contact from "./Contact";
import CreateContact from "./CreateContact";
import { connect } from "react-redux";
import { createContact } from "../../store/actions/contactsActions"

class ContactList extends Component {
  constructor(props) {
    super(props);
    this.clickhandler = this.clickhandler.bind(this);
    this.state = {
      showCreateFrom: false
    };
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

    const { contacts } = this.props;
    return (
      <div className="contact-list container">
        {contacts &&
          contacts.map(contact => {
            return <Contact contactInfo={contact} key={contact.id} />;
          })}
        <button className="btn" onClick={this.clickhandler}>
          Add new contact
        </button>
        {form}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    contacts: state.contacts.contacts
  };
};



export default connect(mapStateToProps)(ContactList);
