import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getUsers
} from "../../store/actions/usersActions";
import { Redirect } from "react-router-dom";

class AddContact extends Component {

  componentDidMount() {
    this.props.getUsers();
  }

  render() {
    const { users, auth } = this.props;
    if (!auth.uid) {
      return <Redirect to="/signin" />;
    }
    return (
      <div>
        {users &&
          users.map((contact, index) => {
            return <div key={index}>
              {contact.uid}
            </div>;
          })}    
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    users: state.users.users,
    auth: state.firebase.auth
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getUsers: () => dispatch(getUsers())
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(AddContact);

