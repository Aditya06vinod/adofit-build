import React from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';

let WebView: any;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('react-native-webview could not be loaded:', e);
  }
}

// Vite development server URL
const DEV_SERVER_URL = "http://192.168.1.6:8080/";

export default function HomeScreen() {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <iframe
          src={DEV_SERVER_URL}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Ado Workout App"
        />
      </View>
    );
  }

  if (!WebView) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>WebView component is not available on this platform.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: DEV_SERVER_URL }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserGesture={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
