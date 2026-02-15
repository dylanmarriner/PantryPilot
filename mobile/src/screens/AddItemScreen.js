import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApi } from '../services/api';

export default function AddItemScreen() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const api = useApi();

  const handleAddItem = async () => {
    if (!name || !quantity || !unit) {
      Alert.alert('Error', 'Please fill in name, quantity, and unit');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        name,
        quantity: parseInt(quantity),
        unit,
        price: price ? Math.round(parseFloat(price) * 100) : 0,
      };

      await api.post('/inventory', itemData);
      Alert.alert('Success', 'Item added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to add item:', error);
      Alert.alert('Error', 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Add New Item</Text>
        
        <Text style={styles.label}>Item Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Milk, Bread, Eggs"
        />
        
        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="e.g., 1, 2, 500"
          keyboardType="numeric"
        />
        
        <Text style={styles.label}>Unit</Text>
        <TextInput
          style={styles.input}
          value={unit}
          onChangeText={setUnit}
          placeholder="e.g., liters, pieces, grams"
        />
        
        <Text style={styles.label}>Price (optional)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="e.g., 2.99"
          keyboardType="decimal-pad"
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleAddItem}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Adding...' : 'Add Item'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
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
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  cancelButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
