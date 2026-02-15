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
import { useApi } from '../services/api';

export default function GroceryListScreen() {
  const [groceryList, setGroceryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const api = useApi();

  const loadGroceryList = async () => {
    try {
      const data = await api.get('/grocery-list');
      setGroceryList(data);
    } catch (error) {
      console.error('Failed to load grocery list:', error);
      Alert.alert('Error', 'Failed to load grocery list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateGroceryList = async () => {
    try {
      const data = await api.post('/grocery-list/generate');
      setGroceryList(data);
      Alert.alert('Success', 'Grocery list generated based on your needs');
    } catch (error) {
      console.error('Failed to generate grocery list:', error);
      Alert.alert('Error', 'Failed to generate grocery list');
    }
  };

  const markItemPurchased = async (itemId) => {
    try {
      await api.put(`/grocery-list/${itemId}`, { purchased: true });
      loadGroceryList();
    } catch (error) {
      console.error('Failed to mark item as purchased:', error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  useEffect(() => {
    loadGroceryList();
  }, []);

  const groupItemsByCategory = (items) => {
    const grouped = {};
    items.forEach(item => {
      const category = item.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  };

  const renderGroceryItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>
          {item.quantity} {item.unit} · ${((item.estimatedPrice || 0) / 100).toFixed(2)}
        </Text>
        {item.priority === 'high' && (
          <Text style={styles.priorityText}>High Priority</Text>
        )}
        {item.reason && (
          <Text style={styles.reasonText}>Reason: {item.reason}</Text>
        )}
      </View>
      <TouchableOpacity 
        style={[styles.purchaseButton, item.purchased && styles.purchasedButton]}
        onPress={() => markItemPurchased(item.id)}
        disabled={item.purchased}
      >
        <Text style={[styles.purchaseButtonText, item.purchased && styles.purchasedButtonText]}>
          {item.purchased ? 'Purchased' : 'Mark Purchased'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategory = ({ category, items }) => (
    <View key={category} style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category}</Text>
      {items.map(item => (
        <View key={item.id}>
          {renderGroceryItem({ item })}
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading grocery list...</Text>
      </View>
    );
  }

  const groupedItems = groupItemsByCategory(groceryList.filter(item => !item.purchased));
  const purchasedItems = groceryList.filter(item => item.purchased);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Grocery List</Text>
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={generateGroceryList}
        >
          <Text style={styles.generateButtonText}>Generate List</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={Object.entries(groupedItems)}
        renderItem={({ item: [category, items] }) => renderCategory({ category, items })}
        keyExtractor={(item) => item[0]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadGroceryList();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items on your grocery list</Text>
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={generateGroceryList}
            >
              <Text style={styles.generateButtonText}>Generate Grocery List</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          purchasedItems.length > 0 ? (
            <View style={styles.purchasedSection}>
              <Text style={styles.purchasedTitle}>Purchased Items</Text>
              {purchasedItems.map(item => (
                <View key={item.id} style={styles.purchasedItem}>
                  <Text style={styles.purchasedItemName}>{item.name}</Text>
                  <Text style={styles.purchasedItemDetails}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
              ))}
            </View>
          ) : null
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
  generateButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  generateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  itemContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 3,
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
  priorityText: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  reasonText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  purchaseButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
  },
  purchasedButton: {
    backgroundColor: '#e0e0e0',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  purchasedButtonText: {
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  purchasedSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 20,
  },
  purchasedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 15,
    marginBottom: 10,
  },
  purchasedItem: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 15,
    marginVertical: 2,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  purchasedItemName: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  purchasedItemDetails: {
    fontSize: 12,
    color: '#999',
  },
});
