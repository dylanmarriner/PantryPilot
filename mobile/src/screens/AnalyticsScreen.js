import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AnalyticsScreen = ({ navigation, route }) => {
  const { household, user } = route.params;
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();

      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      const response = await fetch(
        `/api/households/${household.id}/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = 'json') => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await fetch(
        `/api/households/${household.id}/export?format=${format}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (response.ok) {
        Alert.alert('Success', `Report exported as ${format.toUpperCase()}`);
      } else {
        Alert.alert('Error', 'Failed to export report');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export report');
    }
  };

  const renderOverviewTab = () => {
    if (!analyticsData) return null;

    const { usageStats, costSavings } = analyticsData;

    return (
      <View style={styles.tabContent}>
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="bar-chart-outline" size={24} color="#007AFF" />
            <Text style={styles.metricValue}>{usageStats.totalEvents}</Text>
            <Text style={styles.metricLabel}>Total Activities</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="cash-outline" size={24} color="#34C759" />
            <Text style={styles.metricValue}>${(costSavings.totalSavings / 100).toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Total Savings</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="people-outline" size={24} color="#FF9500" />
            <Text style={styles.metricValue}>{Object.keys(usageStats.userActivity).length}</Text>
            <Text style={styles.metricLabel}>Active Users</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="pricetag-outline" size={24} color="#FF3B30" />
            <Text style={styles.metricValue}>{costSavings.itemsAnalyzed}</Text>
            <Text style={styles.metricLabel}>Items Tracked</Text>
          </View>
        </View>

        {/* Top Savings Items */}
        {costSavings.topSavingsItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Savings Items</Text>
            {costSavings.topSavingsItems.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.savingsItem}>
                <View style={styles.savingsInfo}>
                  <Text style={styles.savingsItemName}>{item.itemName}</Text>
                  <Text style={styles.savingsPercentage}>{item.percentageChange}%</Text>
                </View>
                <Text style={styles.savingsAmount}>
                  ${(item.savings / 100).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Activity Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Breakdown</Text>
          {Object.entries(usageStats.eventTypes).map(([eventType, count]) => (
            <View key={eventType} style={styles.activityItem}>
              <Text style={styles.activityType}>{eventType.replace('_', ' ')}</Text>
              <Text style={styles.activityCount}>{count}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderSavingsTab = () => {
    if (!analyticsData) return null;

    const { costSavings } = analyticsData;

    return (
      <View style={styles.tabContent}>
        <View style={styles.savingsHeader}>
          <Text style={styles.savingsTotal}>
            ${(costSavings.totalSavings / 100).toFixed(2)}
          </Text>
          <Text style={styles.savingsLabel}>Total Savings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {Object.entries(costSavings.categoryBreakdown).map(([category, savings]) => (
            <View key={category} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categorySavings}>
                ${(savings / 100).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Savings Items</Text>
          {costSavings.topSavingsItems.map((item, index) => (
            <View key={index} style={styles.savingsItem}>
              <View style={styles.savingsInfo}>
                <Text style={styles.savingsItemName}>{item.itemName}</Text>
                <Text style={styles.savingsPercentage}>{item.percentageChange}%</Text>
              </View>
              <Text style={styles.savingsAmount}>
                ${(item.savings / 100).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderActivityTab = () => {
    if (!analyticsData) return null;

    const { usageStats } = analyticsData;

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Types</Text>
          {Object.entries(usageStats.eventTypes).map(([eventType, count]) => (
            <View key={eventType} style={styles.activityItem}>
              <Text style={styles.activityType}>{eventType.replace('_', ' ')}</Text>
              <Text style={styles.activityCount}>{count}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Activity</Text>
          {Object.entries(usageStats.userActivity).map(([userId, count]) => (
            <View key={userId} style={styles.activityItem}>
              <Text style={styles.activityType}>User {userId.slice(-8)}</Text>
              <Text style={styles.activityCount}>{count}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Activity</Text>
          {Object.entries(usageStats.dailyActivity)
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 30)
            .map(([date, count]) => (
              <View key={date} style={styles.activityItem}>
                <Text style={styles.activityType}>{date}</Text>
                <Text style={styles.activityCount}>{count}</Text>
              </View>
            ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <TouchableOpacity onPress={() => exportReport()}>
          <Ionicons name="download-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {['7d', '30d', '90d'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        {[
          { key: 'overview', label: 'Overview', icon: 'grid-outline' },
          { key: 'savings', label: 'Savings', icon: 'cash-outline' },
          { key: 'activity', label: 'Activity', icon: 'bar-chart-outline' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? '#007AFF' : '#8E8E93'}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.tabButtonTextActive
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'savings' && renderSavingsTab()}
        {activeTab === 'activity' && renderActivityTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#8E8E93',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#007AFF',
  },
  tabButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#8E8E93',
  },
  tabButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  savingsHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  savingsTotal: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#34C759',
  },
  savingsLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  savingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  savingsInfo: {
    flex: 1,
  },
  savingsItemName: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 2,
  },
  savingsPercentage: {
    fontSize: 14,
    color: '#34C759',
  },
  savingsAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  categoryName: {
    fontSize: 16,
    color: '#000000',
  },
  categorySavings: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  activityType: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  activityCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default AnalyticsScreen;
