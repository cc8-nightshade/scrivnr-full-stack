import React from 'react';

const Transcript = ({transcriptSpeech}) => {
  return(
    <div className="transcripts">
      <div className="row" >
        {transcriptSpeech &&
          transcriptSpeech.map((bubble, index) => {
          return (
            <div key={index} className={ index % 2 ? "col s12 m6 offset-m5 receiveMessage" : "col s12 m6 sendMessage" }>
              {bubble.time}
              <br/>
              {bubble.text}
            </div>
          ) 
        })}
      </div>
    </div>
  )
}

export default Transcript