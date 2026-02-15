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

export default function LunchPlannerScreen() {
  const [lunchPlans, setLunchPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const api = useApi();

  const loadLunchPlans = async () => {
    try {
      const data = await api.get('/lunch-plans');
      setLunchPlans(data);
    } catch (error) {
      console.error('Failed to load lunch plans:', error);
      Alert.alert('Error', 'Failed to load lunch plans');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateLunchPlan = async () => {
    try {
      const plan = await api.post('/lunch-plans/generate');
      setLunchPlans(prev => [plan, ...prev]);
      Alert.alert('Success', 'New lunch plan generated');
    } catch (error) {
      console.error('Failed to generate lunch plan:', error);
      Alert.alert('Error', 'Failed to generate lunch plan');
    }
  };

  useEffect(() => {
    loadLunchPlans();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderLunchPlan = ({ item }) => (
    <View style={styles.planContainer}>
      <View style={styles.planHeader}>
        <Text style={styles.planDate}>{formatDate(item.date)}</Text>
        <Text style={[styles.planStatus, item.status === 'approved' && styles.statusApproved]}>
          {item.status}
        </Text>
      </View>
      
      <View style={styles.mealSection}>
        <Text style={styles.mealTitle}>Main Course</Text>
        <Text style={styles.mealItem}>{item.mainCourse}</Text>
        {item.mainCourseIngredients && (
          <Text style={styles.ingredients}>
            Ingredients: {item.mainCourseIngredients.join(', ')}
          </Text>
        )}
      </View>

      {item.sideDish && (
        <View style={styles.mealSection}>
          <Text style={styles.mealTitle}>Side Dish</Text>
          <Text style={styles.mealItem}>{item.sideDish}</Text>
          {item.sideDishIngredients && (
            <Text style={styles.ingredients}>
              Ingredients: {item.sideDishIngredients.join(', ')}
            </Text>
          )}
        </View>
      )}

      <View style={styles.nutritionSection}>
        <Text style={styles.nutritionTitle}>Nutrition Info</Text>
        <Text style={styles.nutritionItem}>
          Calories: {item.nutrition?.calories || 'N/A'}
        </Text>
        <Text style={styles.nutritionItem}>
          Protein: {item.nutrition?.protein || 'N/A'}g
        </Text>
        <Text style={styles.nutritionItem}>
          Fatigue Score: {item.fatigueScore || 'N/A'}
        </Text>
      </View>

      {item.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading lunch plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lunch Planner</Text>
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={generateLunchPlan}
        >
          <Text style={styles.generateButtonText}>Generate Plan</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={lunchPlans}
        renderItem={renderLunchPlan}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadLunchPlans();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No lunch plans yet</Text>
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={generateLunchPlan}
            >
              <Text style={styles.generateButtonText}>Generate Your First Plan</Text>
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
  planContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  planDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  planStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff9800',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusApproved: {
    color: '#4caf50',
    backgroundColor: '#e8f5e8',
  },
  mealSection: {
    marginBottom: 15,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  mealItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  ingredients: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  nutritionSection: {
    marginBottom: 15,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  nutritionItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  notesText: {
    fontSize: 12,
    color: '#666',
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
});
