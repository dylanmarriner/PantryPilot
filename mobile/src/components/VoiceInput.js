import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Alert 
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import Icon from '@expo/vector-icons/MaterialIcons';

const VoiceInput = ({ onResult, onError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone permission to use voice input');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start voice recording');
      if (onError) onError(error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setIsProcessing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        const transcription = await transcribeAudio(uri);
        if (onResult && transcription) {
          onResult(transcription);
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to process voice recording');
      if (onError) onError(error);
    } finally {
      setRecording(null);
      setIsProcessing(false);
    }
  };

  const transcribeAudio = async (audioUri) => {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'voice-input.wav',
      });

      const response = await fetch('http://localhost:3000/api/speech-to-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Speech-to-text service unavailable');
      }

      const data = await response.json();
      return data.transcription;
    } catch (error) {
      console.error('Speech-to-text failed:', error);
      Alert.alert('Error', 'Voice recognition failed. Please try again or use text input.');
      return null;
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const speakText = (text) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.8,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.microphoneButton,
          isRecording && styles.recordingButton,
          isProcessing && styles.processingButton,
        ]} 
        onPress={handlePress}
        disabled={isProcessing}
      >
        <Icon 
          name={isRecording ? "stop" : "mic"} 
          size={32} 
          color="white" 
        />
      </TouchableOpacity>
      
      <Text style={styles.statusText}>
        {isProcessing ? 'Processing...' : isRecording ? 'Recording... Tap to stop' : 'Tap to speak'}
      </Text>
      
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <View style={styles.recordingDot} />
          <View style={styles.recordingDot} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  microphoneButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: '#f44336',
  },
  processingButton: {
    backgroundColor: '#ff9800',
  },
  statusText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f44336',
    marginHorizontal: 3,
    opacity: 0.7,
  },
});

export default VoiceInput;
