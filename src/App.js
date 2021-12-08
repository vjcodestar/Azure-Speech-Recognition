import React, { Component } from 'react';
import { Container } from 'reactstrap';
import $ from 'jquery';
import './custom.css'
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk')


export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            displayText: 'INITIALIZED: ready to test speech...'
        }
    }
    
    async componentDidMount() {
        // check for valid speech key/region
        const speechRegion = 'eastus';
        $.ajax({
            url: "https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken",
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","0fd7e229d17b44a788e4efce5e3aedf3");
            },
            type: "POST",
            // Request body
            data: '{ "url": "#"}'
        })
        .done(function(data) {
            // Put the object into storage
            sessionStorage.setItem('speech-token', speechRegion+':'+data);

        })
        .fail(function(err) {
            alert("error : "+err);
        });

        // Retrieve the object from storage
        var tokenRes = sessionStorage.getItem('speech-token');

        if (tokenRes === null) {
            this.setState({
                displayText: 'Press the microphone icon for voice recognition'
            });
        }
       
    }

    async sttFromMic() {
        var tokenObj = sessionStorage.getItem('speech-token');
        var authRegion = tokenObj.split(':')[0];
        var authToken = tokenObj.split(':')[1];
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(authToken, authRegion);
        speechConfig.speechRecognitionLanguage = 'en-US';
        
        const audioConfig = speechsdk.AudioConfig.fromMicrophoneInput();
       
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

        this.setState({
            displayText: 'speak into your microphone...'
        });

        recognizer.recognizeOnceAsync(result => {
            let displayText;
            if (result.reason === ResultReason.RecognizedSpeech) {
                displayText = `Spoken Text : ${(result.text).replace(/\./g, "")}`
            } else {
                displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
            }

            this.setState({
                displayText: displayText
            });
        });
    }
    
    render() {
        return (
            <Container className="app-container">
                <h1 className="display-4 mb-3">Voice Recognition Demo</h1>

                <div className="row main-container">
                    <div className="col-6">
                        <i className="fas fa-microphone fa-lg mr-2" onClick={() => this.sttFromMic()}></i>
                        Speak (Press the mic icon)
                        
                        
                    </div>
                    <div className="col-6 output-display rounded">
                        <code>{this.state.displayText}</code>
                    </div>
                </div>
            </Container>
        );
    }
}