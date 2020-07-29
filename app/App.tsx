/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { Client } from 'react-native-ssdp'

declare const global: {HermesInternal: null | {}};

let msg = ""
const client = new Client();
const App = () => {
  const [messages, setMessages] = useState("")
  const [clicked, setClicked] = useState(false)
  const search = () => {
    msg = ""
    setMessages("")
    client.search('clusterpi:node')
    setClicked(true)
  }

  useEffect(() => {
    client.on('response', function (headers, statusCode, rinfo) {
      let _messages = ""
      if (headers["ST"] && headers["ST"].includes("clusterpi:node")) {
        for (const headerName in headers) {
          const headerVal = headers[headerName]
          _messages += `${headerName}: ${headerVal}\n`
        }
      }
      msg += _messages
      setMessages(msg)
    });
  }, [])
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
            <View>

        <Text></Text>
        <Text></Text>
        <Text></Text>
        <Button onPress={search} title="Click Me" />
        <Text>{messages}</Text>
        {clicked && messages == "" ? <Text>Searching...</Text> : <Text></Text>}
            </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
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
