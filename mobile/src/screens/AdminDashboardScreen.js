import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Alert,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('stats');
    const [data, setData] = useState({
        stats: null,
        health: null,
        financials: null
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, healthRes, financialsRes] = await Promise.all([
                apiService.get('/admin/stats'),
                apiService.get('/admin/health'),
                apiService.get('/admin/financials')
            ]);

            setData({
                stats: statsRes.data,
                health: healthRes.data,
                financials: financialsRes.data
            });
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
            Alert.alert('Error', 'Failed to load administrative data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderStatsTab = () => {
        const { stats } = data;
        if (!stats) return null;

        return (
            <View style={styles.tabContent}>
                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <Ionicons name="people-outline" size={24} color="#007AFF" />
                        <Text style={styles.metricValue}>{stats.totalUsers}</Text>
                        <Text style={styles.metricLabel}>Total Users</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Ionicons name="home-outline" size={24} color="#5856D6" />
                        <Text style={styles.metricValue}>{stats.totalHouseholds}</Text>
                        <Text style={styles.metricLabel}>Households</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Ionicons name="cube-outline" size={24} color="#FF9500" />
                        <Text style={styles.metricValue}>{stats.totalItems}</Text>
                        <Text style={styles.metricLabel}>Inventory Items</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Ionicons name="trending-up-outline" size={24} color="#34C759" />
                        <Text style={styles.metricValue}>+{stats.growth.newUsersLast30Days}</Text>
                        <Text style={styles.metricLabel}>New Users (30d)</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Growth Overview</Text>
                    <Text style={styles.sectionText}>
                        The platform is seeing a steady increase in household adoption.
                        User retention is correlated with inventory item density.
                    </Text>
                </View>
            </View>
        );
    };

    const renderHealthTab = () => {
        const { health } = data;
        if (!health) return null;

        return (
            <View style={styles.tabContent}>
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <View style={[styles.statusDot, { backgroundColor: health.status === 'healthy' ? '#34C759' : '#FF3B30' }]} />
                        <Text style={styles.statusTitle}>System Status: {health.status.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.statusDetail}>Last Check: {new Date(health.timestamp).toLocaleTimeString()}</Text>
                </View>

                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <Ionicons name="sync-outline" size={24} color="#007AFF" />
                        <Text style={styles.metricValue}>{health.activeSyncs}</Text>
                        <Text style={styles.metricLabel}>Active Sync Jobs</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Ionicons name="server-outline" size={24} color="#34C759" />
                        <Text style={styles.metricValue}>Stable</Text>
                        <Text style={styles.metricLabel}>Database Node</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('FeatureFlagManager')}
                >
                    <Ionicons name="options-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Manage Feature Flags</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderFinancialsTab = () => {
        const { financials } = data;
        if (!financials) return null;

        return (
            <View style={styles.tabContent}>
                <View style={styles.savingsHeader}>
                    <Text style={styles.savingsTotal}>
                        ${(financials.platformTotalSavings / 100).toFixed(2)}
                    </Text>
                    <Text style={styles.savingsLabel}>Total User Savings tracked</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tier Breakdown</Text>
                    <View style={styles.categoryItem}>
                        <Text style={styles.categoryName}>Free Tier</Text>
                        <Text style={styles.categorySavings}>${(financials.savingsByTier.free / 100).toFixed(2)}</Text>
                    </View>
                    <View style={styles.categoryItem}>
                        <Text style={styles.categoryName}>Pro Tier</Text>
                        <Text style={[styles.categorySavings, { color: '#5856D6' }]}>${(financials.savingsByTier.pro / 100).toFixed(2)}</Text>
                    </View>
                </View>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading Admin Console...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close-outline" size={28} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Super Admin</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.tabSelector}>
                {[
                    { key: 'stats', label: 'Stats', icon: 'analytics-outline' },
                    { key: 'health', label: 'Health', icon: 'pulse-outline' },
                    { key: 'financials', label: 'Financials', icon: 'card-outline' }
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Ionicons name={tab.icon} size={20} color={activeTab === tab.key ? '#007AFF' : '#8E8E93'} />
                        <Text style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {activeTab === 'stats' && renderStatsTab()}
                {activeTab === 'health' && renderHealthTab()}
                {activeTab === 'financials' && renderFinancialsTab()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 16, color: '#8E8E93' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
    tabSelector: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    tabButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabButtonActive: { borderBottomColor: '#007AFF' },
    tabButtonText: { fontSize: 12, color: '#8E8E93', marginTop: 4 },
    tabButtonTextActive: { color: '#007AFF', fontWeight: 'bold' },
    content: { flex: 1 },
    tabContent: { padding: 16 },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
    metricCard: {
        width: (width - 48) / 2,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    metricValue: { fontSize: 24, fontWeight: 'bold', color: '#000000', marginVertical: 8 },
    metricLabel: { fontSize: 12, color: '#8E8E93' },
    statusCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    statusTitle: { fontSize: 16, fontWeight: 'bold' },
    statusDetail: { fontSize: 14, color: '#8E8E93' },
    actionButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8
    },
    actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    savingsHeader: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 12, marginBottom: 16, alignItems: 'center' },
    savingsTotal: { fontSize: 36, fontWeight: 'bold', color: '#34C759' },
    savingsLabel: { fontSize: 16, color: '#8E8E93', marginTop: 4 },
    section: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    sectionText: { fontSize: 14, color: '#3C3C43', lineHeight: 20 },
    categoryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    categoryName: { fontSize: 16 },
    categorySavings: { fontSize: 16, fontWeight: 'bold', color: '#34C759' }
});

export default AdminDashboardScreen;
