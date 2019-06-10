import React from 'react';

const Contact = ({contactInfo}) => {
  return(
    <div className="contact">
      <div className="card ">
        <p>{contactInfo.id}</p>
        <h5>{contactInfo.firstName} {contactInfo.lastName}</h5>
      </div>
    </div>
  )
}

export default Contact