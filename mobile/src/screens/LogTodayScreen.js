import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import VoiceInput from '../components/VoiceInput';
import { useApi } from '../services/api';

export default function LogTodayScreen() {
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const api = useApi();

  const handleLogSubmit = async (text) => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter or speak a log entry');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/logs', { text: text.trim() });
      Alert.alert('Success', 'Log entry processed successfully');
      setTextInput('');
    } catch (error) {
      console.error('Failed to submit log:', error);
      Alert.alert('Error', 'Failed to process log entry');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = (transcript) => {
    setTextInput(transcript);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Log Today</Text>
        <Text style={styles.subtitle}>
          Record what you ate, used, or purchased today
        </Text>

        <View style={styles.inputSection}>
          <Text style={styles.label}>What would you like to log?</Text>
          <TextInput
            style={styles.textInput}
            value={textInput}
            onChangeText={setTextInput}
            placeholder="e.g., 'I ate 2 slices of bread for breakfast' or 'Bought 1 liter of milk'"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.voiceSection}>
          <Text style={styles.label}>Or use voice input:</Text>
          <VoiceInput onResult={handleVoiceResult} />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.buttonDisabled]} 
          onPress={() => handleLogSubmit(textInput)}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Processing...' : 'Submit Log'}
          </Text>
        </TouchableOpacity>

        <View style={styles.examplesSection}>
          <Text style={styles.label}>Examples:</Text>
          <Text style={styles.exampleText}>• "Ate 2 eggs for breakfast"</Text>
          <Text style={styles.exampleText}>• "Used 500ml of milk for coffee"</Text>
          <Text style={styles.exampleText}>• "Bought 1kg of chicken breast"</Text>
          <Text style={styles.exampleText}>• "Finished the loaf of bread"</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 30,
  },
  voiceSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  textInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  examplesSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
