import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getTranscripts,
  setTranscript,
  updateQuestionable
} from "../../store/actions/transcriptsActions";
import moment from "moment";
import "./TranscriptDetail.css";
import { isMetaProperty } from "@babel/types";

class TranscriptList extends Component {

  componentDidMount() {
    this.props.getTranscripts(this.props.auth.email);
  }

  selectItem = (index) => {
    this.props.setTranscript(this.props.transcripts[index], index);
  }

  toggleItem = (index) => {
    // console.log(this.props.transcript.speech[index].questionable);  
    this.props.toggleQuestionable({...this.props.transcript}, index);
  }

  render() {
    const { transcript, transcripts } = this.props;
    console.log(transcripts);
    return (
      <div className="dialogueWrapper">
        <div className="dialogueList">
          <h2 className="asideHead">Transcript</h2>
          <ul className="listWrapper">
            {transcripts &&
              transcripts.map((item, index) => (
                <li
                  key={item.id}
                  onClick={() => {
                    this.selectItem(index);
                  }}
                >
                  {moment(item.startDate.toDate()).format("YYYY/MM/DD HH:MM")}
                </li>
              ))}
          </ul>
        </div>
        <div className="dialogueDetail">
          <div className="inner">
            <ul>
              {transcript.speech &&
                transcript.speech.map((item, index) => {
                  if (item.bookmark && transcript.caller === item.speaker) {
                    return (
                      <li
                        key={index}
                        className="alignCenter borderBottom"
                        style={{ marginBottom: "30px" }}
                      >
                        <span className="bookmark">Bookmark</span>
                      </li>
                    );
                  } else {
                    const time = new Date(transcript.startDate.toDate());
                    time.setSeconds(time.getSeconds() + item.time);
                    return (
                      <li
                        key={index}
                        style={{ marginBottom: "20px" }}
                        className={
                          transcript.caller === item.speaker
                            ? "alignLeft"
                            : "alignRight"
                        }
                      >
                        <p className="textHead">
                          <span className="userName">{item.speaker}</span>

                          <span className="time">
                            {moment(time).format("HH:MM:ss")}
                          </span>
                        </p>
                        <span className="textBox">
                            <label>
                                <input 
                                    type="checkbox" 
                                    className="filled-in" 
                                    checked={!item.questionable}
                                    onChange={() => {this.toggleItem(index)}}/>
                                <span />
                          </label>
                          {item.text}</span>
                      </li>
                    );
                  }
                })}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    transcripts: state.transcripts.transcripts,
    transcript: state.transcripts.transcript,
    auth: state.firebase.auth
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getTranscripts: (email) => dispatch(getTranscripts(email)),
    setTranscript: item => dispatch(setTranscript(item)),
    toggleQuestionable: (transcript, speechIndex) => dispatch(updateQuestionable(transcript, speechIndex))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TranscriptList);