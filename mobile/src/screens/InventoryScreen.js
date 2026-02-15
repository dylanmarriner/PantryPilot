import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApi } from '../services/api';

export default function InventoryScreen() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const api = useApi();

  const loadInventory = async () => {
    try {
      const data = await api.get('/inventory');
      setInventory(data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      Alert.alert('Error', 'Failed to load inventory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await api.put(`/inventory/${itemId}`, { quantity: newQuantity });
      loadInventory();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const adjustQuantity = (itemId, currentQuantity, adjustment) => {
    const newQuantity = Math.max(0, currentQuantity + adjustment);
    updateQuantity(itemId, newQuantity);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>
          {item.quantity} {item.unit} · ${((item.price || 0) / 100).toFixed(2)}
        </Text>
        {item.isLowStock && (
          <Text style={styles.lowStockText}>Low Stock</Text>
        )}
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => adjustQuantity(item.id, item.quantity, -1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => adjustQuantity(item.id, item.quantity, 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={inventory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadInventory();
          }} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Inventory</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddItem')}
            >
              <Text style={styles.addButtonText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  itemContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  lowStockText: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: 'bold',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#2196F3',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
});
