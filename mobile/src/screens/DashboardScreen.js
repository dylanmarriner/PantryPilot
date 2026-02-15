import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useApi } from '../services/api';

export default function DashboardScreen() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const api = useApi();

  const loadDashboardData = async () => {
    try {
      const data = await api.get('/dashboard');
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Dashboard</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Inventory Summary</Text>
        <Text style={styles.cardValue}>
          {dashboardData?.inventory?.totalItems || 0} items
        </Text>
        <Text style={styles.cardSubtitle}>
          {dashboardData?.inventory?.lowStockItems || 0} low stock
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Budget Overview</Text>
        <Text style={styles.cardValue}>
          ${((dashboardData?.budget?.spent || 0) / 100).toFixed(2)}
        </Text>
        <Text style={styles.cardSubtitle}>
          of ${((dashboardData?.budget?.total || 0) / 100).toFixed(2)} spent
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        {dashboardData?.recentActivity?.map((activity, index) => (
          <Text key={index} style={styles.activityItem}>
            {activity.description}
          </Text>
        )) || <Text style={styles.cardSubtitle}>No recent activity</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 10,
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  activityItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
});
