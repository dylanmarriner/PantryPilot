import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../services/auth';

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && (!firstName || !lastName)) {
      Alert.alert('Error', 'Please fill in your name');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const userData = {
          email,
          password,
          firstName,
          lastName
        };
        const user = await signUp(userData);
        
        // After successful signup, navigate to household manager
        navigation.navigate('HouseholdManager', { user });
      } else {
        const user = await signIn(email, password);
        
        // After successful login, get user's households
        try {
          const response = await fetch(`/api/users/${user.id}/households`);
          const households = await response.json();
          
          if (households.length === 0) {
            // No households, go to household manager
            navigation.navigate('HouseholdManager', { user });
          } else if (households.length === 1) {
            // Single household, go directly to dashboard
            navigation.navigate('Dashboard', { household: households[0], user });
          } else {
            // Multiple households, go to household manager
            navigation.navigate('HouseholdManager', { user });
          }
        } catch (error) {
          // If household fetch fails, still proceed to dashboard
          navigation.navigate('Dashboard', { user });
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PantryPilot</Text>
      <Text style={styles.subtitle}>
        {isSignUp ? 'Create Account' : 'Sign In'}
      </Text>
      
      {isSignUp && (
        <>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
        </>
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleAuth}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.linkText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
      
      {!isSignUp && (
        <TouchableOpacity style={styles.forgotPasswordButton}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    color: '#2196F3',
    textDecorationLine: 'underline',
    marginBottom: 15,
  },
  forgotPasswordButton: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#2196F3',
    fontSize: 14,
  },
});
