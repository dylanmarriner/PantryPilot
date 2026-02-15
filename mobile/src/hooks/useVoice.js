import { useState, useEffect, useCallback } from 'react';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

export const useVoice = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recording, setRecording] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    checkPermissions();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Failed to check audio permissions:', error);
      setPermissionStatus('denied');
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionStatus(status);
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request audio permissions:', error);
      setPermissionStatus('denied');
      return false;
    }
  };

  const startRecording = useCallback(async () => {
    if (permissionStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) {
        throw new Error('Microphone permission is required for voice input');
      }
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      return newRecording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Failed to start voice recording');
    }
  }, [permissionStatus]);

  const stopRecording = useCallback(async () => {
    if (!recording) {
      throw new Error('No recording in progress');
    }

    setIsRecording(false);
    setIsProcessing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      const transcription = await transcribeAudio(uri);
      return transcription;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw new Error('Failed to process voice recording');
    } finally {
      setIsProcessing(false);
    }
  }, [recording]);

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
        throw new Error(`Speech-to-text service error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.transcription) {
        throw new Error('No transcription received from service');
      }

      return data.transcription;
    } catch (error) {
      console.error('Speech-to-text failed:', error);
      throw new Error('Voice recognition failed. Please try again or use text input.');
    }
  };

  const speakText = useCallback((text, options = {}) => {
    const defaultOptions = {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.8,
      volume: 1.0,
      ...options,
    };

    return Speech.speak(text, defaultOptions);
  }, []);

  const stopSpeaking = useCallback(() => {
    return Speech.stop();
  }, []);

  const isSpeaking = useCallback(async () => {
    return await Speech.isSpeakingAsync();
  }, []);

  const cancelRecording = useCallback(async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        setRecording(null);
        setIsRecording(false);
        setIsProcessing(false);
      } catch (error) {
        console.error('Failed to cancel recording:', error);
      }
    }
  }, [recording]);

  return {
    isRecording,
    isProcessing,
    permissionStatus,
    startRecording,
    stopRecording,
    cancelRecording,
    speakText,
    stopSpeaking,
    isSpeaking,
    requestPermissions,
  };
};
