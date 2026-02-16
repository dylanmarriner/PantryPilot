import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  Clock,
  ChevronLeft,
} from "lucide-react-native";
import { useApi } from "../services/api";
import { Theme } from "../styles/DesignSystem";
import GlassCard from "../components/GlassCard";
import AuroraBackground from "../components/AuroraBackground";

const { width: screenWidth } = Dimensions.get("window");

export default function BudgetOverviewScreen({ navigation }) {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const api = useApi();

  const loadBudgetData = async () => {
    try {
      // Real API call
      const data = await api.get("/budget");
      setBudgetData(data);
    } catch (error) {
      console.error("Failed to load budget data:", error);
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

    const colors = [
      Theme.colors.primary,
      Theme.colors.secondary,
      Theme.colors.warning,
      Theme.colors.error,
    ];

    return budgetData.breakdown.map((item, index) => ({
      name: item.category,
      population: item.amount,
      color: colors[index % colors.length],
      legendFontColor: Theme.colors.text.primary,
      legendFontSize: 10,
    }));
  };

  const formatCurrency = (amount) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const getBudgetStatus = () => {
    if (!budgetData)
      return { color: Theme.colors.text.dimmed, text: "UNKNOWN" };
    const percentage = (budgetData.spent / budgetData.total) * 100;

    if (percentage >= 100)
      return { color: Theme.colors.error, text: "CAPACITY EXCEEDED" };
    if (percentage >= 80)
      return { color: Theme.colors.warning, text: "CRITICAL THRESHOLD" };
    return { color: Theme.colors.primary, text: "NOMINAL" };
  };

  if (loading) {
    return (
      <AuroraBackground>
        <View style={styles.center}>
          <ActivityIndicator color={Theme.colors.primary} />
        </View>
      </AuroraBackground>
    );
  }

  const budgetStatus = getBudgetStatus();
  const pieChartData = preparePieChartData();

  return (
    <AuroraBackground>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefres={onRefresh}
            tintColor={Theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>BUDGET ANALYTICS</Text>
          <Text style={styles.statusLabel}>{budgetStatus.text}</Text>
        </View>

        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Wallet size={16} color={Theme.colors.primary} />
            <Text style={styles.summaryLabel}>TOTAL CYCLE BUDGET</Text>
          </View>
          <Text style={styles.budgetTotal}>
            {formatCurrency(budgetData?.total || 0)}
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(((budgetData?.spent || 0) / (budgetData?.total || 1)) * 100, 100)}%`,
                    backgroundColor: budgetStatus.color,
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.spentText}>
                {formatCurrency(budgetData?.spent || 0)} SPENT
              </Text>
              <Text style={styles.remainingText}>
                {formatCurrency(
                  (budgetData?.total || 0) - (budgetData?.spent || 0),
                )}{" "}
                REMAINING
              </Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>ALLOCATION MATRIX</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={pieChartData}
              width={screenWidth - 80}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              center={[0, 0]}
              absolute
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={14} color={Theme.colors.primary} />
            <Text style={styles.sectionTitle}>T.O.M. INSIGHTS</Text>
          </View>
          {budgetData?.insights?.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <AlertCircle
                size={12}
                color={Theme.colors.primary}
                style={{ marginTop: 2 }}
              />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Clock size={14} color={Theme.colors.primary} />
            <Text style={styles.sectionTitle}>LEDGER LOGS</Text>
          </View>
          {budgetData?.recentTransactions?.map((tr, idx) => (
            <View key={idx} style={styles.transactionItem}>
              <View>
                <Text style={styles.trDesc}>
                  {tr.description.toUpperCase()}
                </Text>
                <Text style={styles.trDate}>
                  {new Date(tr.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.trAmount}>{formatCurrency(tr.amount)}</Text>
            </View>
          ))}
        </GlassCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  title: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 4,
  },
  statusLabel: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  summaryCard: {
    margin: 20,
    padding: 24,
    gap: 16,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryLabel: {
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  budgetTotal: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "900",
  },
  progressContainer: { gap: 8 },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%" },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  spentText: {
    color: Theme.colors.text.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  remainingText: {
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  insightItem: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(34, 211, 238, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.1)",
  },
  insightText: {
    flex: 1,
    color: Theme.colors.text.primary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  trDesc: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  trDate: {
    color: Theme.colors.text.dimmed,
    fontSize: 12,
    fontWeight: "600",
  },
  trAmount: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
