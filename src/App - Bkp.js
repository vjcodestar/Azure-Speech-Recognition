import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { getTokenOrRefresh } from './token_util';
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
        // const that = this; 
        
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
            // alert('Token from server : '+'eastus:'+data);
            // alert("success");
            document.cookie = "speech-token="+'eastus:'+data+"; expires=0; path=/";
        })
        .fail(function() {
            // alert("error");
        });

        const tokenRes = ('; '+document.cookie).split(`; speech-token=`).pop().split(';')[0];
        // const tokenRes = await getTokenOrRefresh();
        if (tokenRes === null) {
            this.setState({
                displayText: 'FATAL_ERROR: token not found'
            });
        }
        // if (tokenRes.authToken === null) {
        //     this.setState({
        //         displayText: 'FATAL_ERROR: ' + tokenRes.error
        //     });
        // }
    }

    async sttFromMic() {
        // const tokenObj = await getTokenOrRefresh();
        const tokenObj = ('; '+document.cookie).split(`; speech-token=`).pop().split(';')[0];
        var authRegion = tokenObj.split(':')[0];
        var authToken = tokenObj.split(':')[1];
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(authToken, authRegion);
        speechConfig.speechRecognitionLanguage = 'en-US';
        
        // const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
        
        // Device ID  
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          console.log("enumerateDevices() not supported.");
          return;
        }

        // List cameras and microphones.

        navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
          devices.forEach(function(device) {
            alert(device.kind + ": " + device.label + " id = " + device.deviceId);
          });
        })
        .catch(function(err) {
          alert(err.name + ": " + err.message);
        });
        // Device ID Ends

        const audioConfig = speechsdk.AudioConfig.fromMicrophoneInput();
        alert(audioConfig);
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

        this.setState({
            displayText: 'speak into your microphone...'
        });

        recognizer.recognizeOnceAsync(result => {
            let displayText;
            if (result.reason === ResultReason.RecognizedSpeech) {
                displayText = `RECOGNIZED: Text=${result.text}`
            } else {
                displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
            }

            this.setState({
                displayText: displayText
            });
        });
    }
    /*
    async fileChange(event) {
        const audioFile = event.target.files[0];
        console.log(audioFile);
        const fileInfo = audioFile.name + ` size=${audioFile.size} bytes `;

        this.setState({
            displayText: fileInfo
        });

        const tokenObj = await getTokenOrRefresh();
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
        speechConfig.speechRecognitionLanguage = 'en-US';

        const audioConfig = speechsdk.AudioConfig.fromWavFileInput(audioFile);
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizeOnceAsync(result => {
            let displayText;
            if (result.reason === ResultReason.RecognizedSpeech) {
                displayText = `RECOGNIZED: Text=${result.text}`
            } else {
                displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
            }

            this.setState({
                displayText: fileInfo + displayText
            });
        });
    }
    */
    render() {
        return (
            <Container className="app-container">
                <h1 className="display-4 mb-3">Speech sample app</h1>

                <div className="row main-container">
                    <div className="col-6">
                        <i className="fas fa-microphone fa-lg mr-2" onClick={() => this.sttFromMic()}></i>
                        Convert speech to text from your mic.
                        
                        
                    </div>
                    <div className="col-6 output-display rounded">
                        <code>{this.state.displayText}</code>
                    </div>
                </div>
            </Container>
        );
    }
}