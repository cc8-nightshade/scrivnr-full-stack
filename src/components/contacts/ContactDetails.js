import React from 'react';

const ContactDetails = (props) => {
  return(
    <div className="contact">
        <div className="card ">
            <h2>{props.match.params.id}</h2>
            <h3>name</h3>
            <h4>info</h4>
        </div>
    </div>
  )
}

export default ContactDetails