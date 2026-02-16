import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Tag,
  ChevronLeft,
  Download,
  Grid,
  Activity,
} from "lucide-react-native";
import { Theme } from "../styles/DesignSystem";
import { useApi } from "../services/api";
import GlassCard from "../components/GlassCard";
import AuroraBackground from "../components/AuroraBackground";

const { width } = Dimensions.get("window");

const AnalyticsScreen = ({ navigation, route }) => {
  // Safe navigation fallback for testing
  const household = route.params?.household || {};

  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const api = useApi();

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await api.get(
        `/households/${household.id}/analytics?period=${selectedPeriod}`,
      );
      setAnalyticsData(data);
    } catch (error) {
      console.error("Analytics load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewTab = () => {
    if (!analyticsData) return null;
    const { usageStats, costSavings } = analyticsData;

    return (
      <View style={styles.tabContent}>
        <View style={styles.metricsGrid}>
          <GlassCard style={styles.metricCard}>
            <BarChart3 size={20} color={Theme.colors.primary} />
            <Text style={styles.metricValue}>{usageStats.totalEvents}</Text>
            <Text style={styles.metricLabel}>TOTAL ACTIVITIES</Text>
          </GlassCard>

          <GlassCard style={styles.metricCard}>
            <DollarSign size={20} color={Theme.colors.success} />
            <Text style={styles.metricValue}>
              ${(costSavings.totalSavings / 100).toFixed(2)}
            </Text>
            <Text style={styles.metricLabel}>TOTAL SAVINGS</Text>
          </GlassCard>

          <GlassCard style={styles.metricCard}>
            <Users size={20} color={Theme.colors.secondary} />
            <Text style={styles.metricValue}>
              {Object.keys(usageStats.userActivity).length}
            </Text>
            <Text style={styles.metricLabel}>ACTIVE NODES</Text>
          </GlassCard>

          <GlassCard style={styles.metricCard}>
            <Tag size={20} color={Theme.colors.warning} />
            <Text style={styles.metricValue}>{costSavings.itemsAnalyzed}</Text>
            <Text style={styles.metricLabel}>ASSETS TRACKED</Text>
          </GlassCard>
        </View>

        <GlassCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>EFFICIENCY LEADERS</Text>
          {costSavings.topSavingsItems.map((item, index) => (
            <View key={index} style={styles.listRow}>
              <View style={styles.rowInfo}>
                <Text style={styles.itemName}>
                  {item.itemName.toUpperCase()}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.percentageChange}% VARIANCE
                </Text>
              </View>
              <Text style={styles.itemValue}>
                +${(item.savings / 100).toFixed(2)}
              </Text>
            </View>
          ))}
        </GlassCard>
      </View>
    );
  };

  const renderSavingsTab = () => {
    if (!analyticsData) return null;
    const { costSavings } = analyticsData;

    return (
      <View style={styles.tabContent}>
        <GlassCard style={styles.savingsHero}>
          <Text style={styles.heroValue}>
            ${(costSavings.totalSavings / 100).toFixed(2)}
          </Text>
          <Text style={styles.heroLabel}>TOTAL VAULT OPTIMIZATION</Text>
        </GlassCard>

        <GlassCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>CATEGORY BREAKDOWN</Text>
          {Object.entries(costSavings.categoryBreakdown).map(
            ([category, savings]) => (
              <View key={category} style={styles.listRow}>
                <Text style={styles.itemName}>{category.toUpperCase()}</Text>
                <Text style={styles.itemValue}>
                  ${(savings / 100).toFixed(2)}
                </Text>
              </View>
            ),
          )}
        </GlassCard>
      </View>
    );
  };

  return (
    <AuroraBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ChevronLeft size={24} color={Theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>ANALYTICS ENGINE</Text>
          <TouchableOpacity style={styles.backBtn}>
            <Download size={20} color={Theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.periodSelector}>
          {["7D", "30D", "90D"].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodBtn,
                selectedPeriod.toUpperCase() === p && styles.periodBtnActive,
              ]}
              onPress={() => setSelectedPeriod(p.toLowerCase())}
            >
              <Text
                style={[
                  styles.periodBtnText,
                  selectedPeriod.toUpperCase() === p &&
                    styles.periodBtnTextActive,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabs}>
          {[
            { key: "overview", label: "OVERVIEW", icon: Grid },
            { key: "savings", label: "SAVINGS", icon: DollarSign },
            { key: "activity", label: "ACTIVITY", icon: Activity },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabBtn,
                activeTab === tab.key && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <tab.icon
                size={16}
                color={
                  activeTab === tab.key
                    ? Theme.colors.primary
                    : Theme.colors.text.dimmed
                }
              />
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === tab.key && styles.tabBtnTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Theme.colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "overview" && renderOverviewTab()}
            {activeTab === "savings" && renderSavingsTab()}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </View>
    </AuroraBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: { p: 8 },
  title: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 4,
  },
  periodSelector: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  periodBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  periodBtnActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  periodBtnText: {
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  periodBtnTextActive: { color: "#000" },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: { borderBottomColor: Theme.colors.primary },
  tabBtnText: {
    color: Theme.colors.text.dimmed,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  tabBtnTextActive: { color: Theme.colors.primary },
  content: { flex: 1 },
  tabContent: { padding: 20, gap: 20 },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: (width - 40 - 12) / 2,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  metricValue: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
  },
  metricLabel: {
    color: Theme.colors.text.dimmed,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  sectionCard: { padding: 20, gap: 16 },
  sectionTitle: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    paddingBottom: 12,
  },
  rowInfo: { gap: 4 },
  itemName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  itemMeta: {
    color: Theme.colors.text.dimmed,
    fontSize: 12,
    fontWeight: "600",
  },
  itemValue: {
    color: Theme.colors.success,
    fontSize: 14,
    fontWeight: "900",
  },
  savingsHero: {
    padding: 30,
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(34, 211, 238, 0.05)",
  },
  heroValue: {
    color: Theme.colors.success,
    fontSize: 40,
    fontWeight: "900",
  },
  heroLabel: {
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AnalyticsScreen;
