import React, { Component } from "react";
import Contact from "./Contact";
import CreateContact from "./CreateContact";
import { connect } from "react-redux";
import { getContacts } from "../../store/actions/contactsActions"



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
    this.props.getContact()
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

    console.log(this.props)
    const { contacts } = this.props;
    return (
      <div className="contact-list container">
        {contacts &&
          contacts.map((contact, index) => {
            return <Contact contactInfo={contact} key={index} />;
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

const mapDispatchToProps = (dispatch) => {
  return {
    getContact: () => dispatch(getContacts())
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(ContactList);
// export default compose(
//   connect( mapStateToProps),
//   firestoreConnect([
//     { collection: 'contacts' }
//   ]),
// )(ContactList)
