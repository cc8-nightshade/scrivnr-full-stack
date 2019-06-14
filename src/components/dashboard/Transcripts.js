import React, { Component } from 'react';
import { connect } from 'react-redux'
import Transcript from './Transcript'
import { getTranscripts } from "../../store/actions/transcriptsActions"


class Transcripts extends Component {

  componentDidMount(){
    this.props.getTranscripts()
  }

  render () {
    const { transcripts } = this.props
    return (
      <div className="contact-list container">
        {transcripts &&
          transcripts.map((transcript, index) => {
            return <Transcript transcriptSpeech={transcript.speech} key={index} />;
          })}
        {/* <button className="btn" onClick={this.clickhandler}>
          Add new contact
        </button>
        {form} */}
      </div>

    )
  }
}

const mapStateToProps = (state) => {
  return {
    transcripts: state.transcripts.transcript
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getTranscripts: () => dispatch(getTranscripts())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Transcripts)