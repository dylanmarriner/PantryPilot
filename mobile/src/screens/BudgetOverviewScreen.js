import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  Dimensions 
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useApi } from '../services/api';

const { width: screenWidth } = Dimensions.get('window');

export default function BudgetOverviewScreen() {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const api = useApi();

  const loadBudgetData = async () => {
    try {
      const data = await api.get('/budget');
      setBudgetData(data);
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBudgetData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadBudgetData();
  };

  const preparePieChartData = () => {
    if (!budgetData?.breakdown) return [];
    
    const colors = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];
    
    return budgetData.breakdown.map((item, index) => ({
      name: item.category,
      population: item.amount,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 12,
    }));
  };

  const formatCurrency = (amount) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const getBudgetStatus = () => {
    if (!budgetData) return { color: '#666', text: 'Unknown' };
    
    const percentage = (budgetData.spent / budgetData.total) * 100;
    
    if (percentage >= 100) {
      return { color: '#F44336', text: 'Over Budget' };
    } else if (percentage >= 80) {
      return { color: '#FF9800', text: 'Near Limit' };
    } else if (percentage >= 60) {
      return { color: '#FFC107', text: 'On Track' };
    } else {
      return { color: '#4CAF50', text: 'Good' };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading budget overview...</Text>
      </View>
    );
  }

  const budgetStatus = getBudgetStatus();
  const pieChartData = preparePieChartData();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Budget Overview</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Monthly Budget</Text>
        <Text style={styles.budgetTotal}>{formatCurrency(budgetData?.total || 0)}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min((budgetData?.spent || 0) / (budgetData?.total || 1) * 100, 100)}%`,
                  backgroundColor: budgetStatus.color 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {formatCurrency(budgetData?.spent || 0)} / {formatCurrency(budgetData?.total || 0)}
          </Text>
        </View>
        <Text style={[styles.statusText, { color: budgetStatus.color }]}>
          {budgetStatus.text}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spending Breakdown</Text>
        {pieChartData.length > 0 ? (
          <>
            <PieChart
              data={pieChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
              absolute
            />
            <View style={styles.legendContainer}>
              {pieChartData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View 
                    style={[styles.legendColor, { backgroundColor: item.color }]} 
                  />
                  <Text style={styles.legendText}>
                    {item.name}: {formatCurrency(item.population)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.noDataText}>No spending data available</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Budget Insights</Text>
        {budgetData?.insights?.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        )) || <Text style={styles.noDataText}>No insights available</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Transactions</Text>
        {budgetData?.recentTransactions?.map((transaction, index) => (
          <View key={index} style={styles.transactionItem}>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.transactionAmount}>
              {formatCurrency(transaction.amount)}
            </Text>
          </View>
        )) || <Text style={styles.noDataText}>No recent transactions</Text>}
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
  summaryCard: {
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
    marginBottom: 15,
    color: '#333',
  },
  budgetTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  statusText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  legendContainer: {
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
  insightItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  insightText: {
    fontSize: 14,
    color: '#333',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
});
