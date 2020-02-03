/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals
} from 'react-native-webrtc';

class App extends React.Component {

  state = { offer: "" }

  constructor(props) {
    super(props)
    const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
    const pc = new RTCPeerConnection(configuration);
    const pc2 = new RTCPeerConnection(configuration);

    let isFront = true;
    mediaDevices.enumerateDevices().then(sourceInfos => {
      console.log(sourceInfos);
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if(sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "environment")) {
          videoSourceId = sourceInfo.deviceId;
        }
      }
      mediaDevices.getUserMedia({
        audio: true,
        video: {
          mandatory: {
            minWidth: 500, // Provide your own width, height and frame rate here
            minHeight: 300,
            minFrameRate: 30
          },
          facingMode: (isFront ? "user" : "environment"),
          optional: (videoSourceId ? [{sourceId: videoSourceId}] : [])
        }
      })
      .then(stream => {
        console.log("ADDING STREAMS!");
        pc.addStream(stream); 
        pc2.addStream(stream); 
        this.setState({ localStream: stream });
        pc.createOffer().then(desc => {
          pc.setLocalDescription(desc).then(() => {
            console.log("DESC1 --> " + JSON.stringify(desc))
            pc2.setRemoteDescription(desc);
            pc2.createAnswer().then(desc2 => {
              pc2.setLocalDescription(desc2).then(() => {
                console.log(" DESC2 --> " + JSON.stringify(desc2))
                pc.setRemoteDescription(desc2);
              });
            });
          });
        });
      })
      .catch(error => {
        // Log error
      });
    });

    pc.onaddstream = event => {
      console.log("Stream 1 addeed");
      this.setState({ stream1: event.stream });
    }

    pc2.onaddstream = event => {
      console.log("Stream 2 addeed");
      this.setState({ stream2: event.stream });
    }

    pc.onicecandidate = function (event) {
      console.log("Event ice candidate: " + JSON.stringify(event.candidate))
      if (event.candidate)
      pc2.addIceCandidate(event.candidate);
    };

    pc2.onicecandidate = function (event) {
      console.log("Event ice candidate 2: " + JSON.stringify(event.candidate))
      if (event.candidate)
      pc.addIceCandidate(event.candidate);
    };
  }

 buildRTC = () => {
   if (this.state.stream1 && this.state.stream2) {
    console.log("returning video");
    console.log(this.state.stream1.toURL());
    console.log(this.state.localStream.toURL());
    return (
      <>
      <RTCView streamURL = { this.state.stream1.toURL() } style = {{ width: 400, height: 400 }}/>
      <RTCView streamURL = { this.state.stream2.toURL() } style = {{ width: 400, height: 400 }}/>
      </>
    );
   } else {
     return (<View/>);
   }
  }

  render() {
    return (
      <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        { this.buildRTC() }
      </SafeAreaView>
    </>
    );
  }
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
