import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import {
  Bell,
  ScanLine,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Wallet,
  Package,
  CheckCircle2,
  ChevronRight,
  Settings,
  Bot,
} from "lucide-react-native";
import { useApi } from "../services/api";
import { useAuth } from "../services/auth";
import { Theme } from "../styles/DesignSystem";
import GlassCard from "../components/GlassCard";
import AuroraBackground from "../components/AuroraBackground";
import TomTerminal from "../components/TomTerminal";

const { width } = Dimensions.get("window");

export default function DashboardScreen({ navigation }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const api = useApi();
  const { user } = useAuth();

  const loadDashboardData = async () => {
    try {
      const data = await api.get("/dashboard");
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
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

  const navigateToAdmin = () => {
    navigation.navigate("AdminDashboard");
  };

  if (loading) {
    return (
      <AuroraBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>INITIALIZING OPS HUB...</Text>
        </View>
      </AuroraBackground>
    );
  }

  const totalItems = dashboardData?.inventorySummary?.totalItems || 0;
  const lowStockItems = dashboardData?.inventorySummary?.lowStockItems || 0;
  const stockPercentage =
    totalItems > 0
      ? Math.round(((totalItems - lowStockItems) / totalItems) * 100)
      : 0;

  return (
    <AuroraBackground>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>
            LINK ESTABLISHED: {user?.firstName?.toUpperCase() || "USER"}
          </Text>
          <Text style={styles.stockStatus}>
            VAULT STATUS: {stockPercentage}% ASSET CAPACITY
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={20} color={Theme.colors.text.primary} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Scanner")}
          >
            <ScanLine size={20} color={Theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary}
          />
        }
      >
        {/* Admin Section */}
        {user?.isAdmin && (
          <TouchableOpacity onPress={navigateToAdmin}>
            <GlassCard style={styles.adminCard}>
              <View style={styles.adminHeader}>
                <ShieldCheck size={20} color={Theme.colors.success} />
                <Text style={styles.adminTitle}>OWNER CONSOLE</Text>
              </View>
              <Text style={styles.adminSubtitle}>
                Global platform metrics & health
              </Text>
              <View style={styles.adminAction}>
                <Text style={styles.adminActionText}>MANAGE PLATFORM</Text>
                <ChevronRight size={14} color={Theme.colors.text.primary} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <GlassCard style={[styles.statItem, styles.expiringStat]}>
            <AlertCircle size={18} color={Theme.colors.secondary} />
            <Text style={styles.statValue}>
              {dashboardData?.inventory?.lowStockItems || 0}
            </Text>
            <Text style={styles.statLabel}>EXPIRING SOON</Text>
          </GlassCard>

          <GlassCard style={[styles.statItem, styles.wasteStat]}>
            <TrendingUp size={18} color={Theme.colors.primary} />
            <Text style={styles.statValue}>
              ${(dashboardData?.inventorySummary?.totalValue || 0).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>INVENTORY VALUE</Text>
          </GlassCard>
        </View>

        {/* Budget Status */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Wallet size={16} color={Theme.colors.text.secondary} />
              <Text style={styles.cardTitle}>BUDGET STATUS</Text>
            </View>
            <Text style={styles.budgetAmount}>
              ${((dashboardData?.budget?.spent || 0) / 100).toFixed(0)} / $
              {((dashboardData?.budget?.total || 0) / 100).toFixed(0)}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, ((dashboardData?.budget?.spent || 0) / (dashboardData?.budget?.total || 1)) * 100)}%`,
                },
              ]}
            />
          </View>
        </GlassCard>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionHeader}>RECENT LOGS</Text>
          {dashboardData?.recentActivity?.map((activity, index) => (
            <GlassCard key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Package size={16} color={Theme.colors.text.secondary} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>
                  {activity.description.toUpperCase()}
                </Text>
                <Text style={styles.activityTime}>
                  TELEMETRY SYNCED JUST NOW
                </Text>
              </View>
              <CheckCircle2
                size={14}
                color={Theme.colors.primary}
                opacity={0.5}
              />
            </GlassCard>
          )) || (
            <Text style={styles.emptyText}>NO RECENT ACTIVITY DETECTED</Text>
          )}
        </View>

        {/* Weather Suggestion (Spec Requirement) */}
        <GlassCard style={styles.weatherCard}>
          <View>
            <Text style={styles.weatherStatus}>CLEAR SKIES EXPECTED</Text>
            <Text style={styles.weatherSuggestion}>
              Consider stocking up on beverages & ice cream
            </Text>
          </View>
        </GlassCard>
      </ScrollView>

      {/* AI Terminal Trigger */}
      <View style={styles.assistantTriggerContainer}>
        <TouchableOpacity
          style={styles.assistantTrigger}
          onPress={() => setIsAssistantOpen(true)}
        >
          <Bot size={28} color={Theme.colors.primary} />
          <View style={styles.assistantPulse} />
        </TouchableOpacity>
      </View>

      <TomTerminal
        visible={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.md,
    paddingBottom: 100,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  welcomeText: {
    color: Theme.colors.text.primary,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -1,
  },
  stockStatus: {
    color: Theme.colors.text.secondary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.secondary,
    borderWidth: 2,
    borderColor: Theme.colors.background,
  },
  adminCard: {
    marginBottom: Theme.spacing.md,
    borderColor: "rgba(16, 185, 129, 0.3)",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  adminTitle: {
    color: Theme.colors.text.primary,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  adminSubtitle: {
    color: Theme.colors.text.secondary,
    fontSize: 14,
    marginBottom: 12,
  },
  adminAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  adminActionText: {
    color: Theme.colors.text.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  statsGrid: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  statItem: {
    flex: 1,
    padding: Theme.spacing.md,
  },
  expiringStat: {
    backgroundColor: "rgba(217, 70, 239, 0.05)",
  },
  wasteStat: {
    backgroundColor: "rgba(34, 211, 238, 0.05)",
  },
  statValue: {
    color: Theme.colors.text.primary,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
  },
  statLabel: {
    color: Theme.colors.text.secondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  card: {
    marginBottom: Theme.spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    color: Theme.colors.text.primary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  budgetAmount: {
    color: Theme.colors.primary,
    fontSize: 16,
    fontWeight: "900",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Theme.colors.primary,
  },
  activitySection: {
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  sectionHeader: {
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
    paddingHorizontal: Theme.spacing.sm,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    justifyContent: "center",
    alignItems: "center",
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    color: Theme.colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  activityTime: {
    color: Theme.colors.text.dimmed,
    fontSize: 12,
    marginTop: 2,
  },
  weatherCard: {
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
    backgroundColor: "rgba(34, 211, 238, 0.05)",
  },
  weatherStatus: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },
  weatherSuggestion: {
    color: Theme.colors.text.secondary,
    fontSize: 14,
  },
  emptyText: {
    color: Theme.colors.text.dimmed,
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  assistantTriggerContainer: {
    position: "absolute",
    bottom: 30,
    right: 30,
  },
  assistantTrigger: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  assistantPulse: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    opacity: 0.2,
  },
});
