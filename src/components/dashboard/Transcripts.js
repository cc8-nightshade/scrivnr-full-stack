import React, { Component } from 'react';
import { connect } from 'react-redux'


class Transcripts extends Component {
  render () {
    // console.log(this.props.transcript[0].speech[0].time)
    const { transcript } = this.props
    return (
      <div className="transcripts container">
        <div className="row">
          <div className="col s12 m6 sendMessage">
          {transcript[0].speech[0].time}
          <br/>
          {transcript[0].speech[0].text}
          </div>
          <div className="col s12 m6 offset-m5 receiveMessage">
          {transcript[0].speech[1].time}
          <br/>
          {transcript[0].speech[1].text}
          </div> 
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    transcript: state.transcripts.transcript
  }
}



export default connect(mapStateToProps)(Transcripts)