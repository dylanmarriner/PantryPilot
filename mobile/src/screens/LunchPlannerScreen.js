import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import {
  ChefHat,
  Calendar,
  Clock,
  Zap,
  Info,
  Utensils,
  User,
  RefreshCw,
  ShoppingCart,
  DollarSign,
} from "lucide-react-native";
import { useAuth } from "../services/auth";
import { useApi } from "../services/api";
import { Theme } from "../styles/DesignSystem";
import GlassCard from "../components/GlassCard";
import AuroraBackground from "../components/AuroraBackground";

export default function LunchPlannerScreen() {
  const [activeTab, setActiveTab] = useState("dinners"); // 'dinners' | 'lunches'
  const [budget, setBudget] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const api = useApi();

  const generatePlan = async () => {
    try {
      setLoading(true);
      // In prod, check if inventory is empty, if so fetch it
      // For now, pass null to let backend fetch it
      const response = await api.post("/ai/generate-plan", {
        householdId: user.householdId,
        inventory: null,
        budget: budget ? parseFloat(budget) : null,
      });

      if (response && response.plan) {
        setPlan(response.plan);
      }
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToShoppingList = async (itemName) => {
    try {
      await api.post("/grocery-list/add", {
        name: itemName,
        quantity: 1,
        category: "GENERAL", // AI could provide this too
        priority: "medium",
        source: "meal_strategist",
      });
      Alert.alert("LOGISTICS UPDATE", `${itemName} added to acquisition list.`);
    } catch (error) {
      console.error("Failed to add to list:", error);
      Alert.alert("ERROR", "Failed to update logistics.");
    }
  };

  useEffect(() => {
    generatePlan();
  }, []);

  const renderDinnerItem = ({ item }) => (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>
            MATCH: {Math.round((item.score || 0) * 100)}%
          </Text>
        </View>
        <Text style={styles.costText}>
          <DollarSign size={10} color={Theme.colors.text.dimmed} />
          EST. ${item.costEstimate || "0.00"}
        </Text>
      </View>

      <Text style={styles.mealTitle}>{item.name?.toUpperCase()}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Clock size={12} color={Theme.colors.primary} />
          <Text style={styles.statText}>
            {(item.prepTime || 0) + (item.cookTime || 0)} MIN
          </Text>
        </View>
        <View style={styles.statItem}>
          <Utensils size={12} color={Theme.colors.primary} />
          <Text style={styles.statText}>{item.difficulty?.toUpperCase()}</Text>
        </View>
        <View style={styles.statItem}>
          <Zap size={12} color={Theme.colors.warning} />
          <Text style={styles.statText}>LEFTOVER: {item.leftoverScore}/10</Text>
        </View>
      </View>

      {/* Shopping Suggestions for Dinner */}
      {item.missingIngredients && item.missingIngredients.length > 0 && (
        <TouchableOpacity
          style={styles.shoppingSection}
          onPress={() => addToShoppingList(item.missingIngredients[0])} // Just add first for MVP or specific interaction
        >
          <ShoppingCart size={12} color={Theme.colors.secondary} />
          <Text style={styles.shoppingText}>
            MISSING: {item.missingIngredients.join(", ").toUpperCase()}
          </Text>
        </TouchableOpacity>
      )}

      {item.instructions && (
        <View style={styles.briefing}>
          <Text style={styles.briefingLabel}>TACTICAL INSTRUCTIONS</Text>
          <Text style={styles.briefingText} numberOfLines={2}>
            {item.instructions}
          </Text>
        </View>
      )}
    </GlassCard>
  );

  const renderLunchSlot = (kid, slot) => {
    // Access the plan structure: iterate `plan.lunches.templates` which has `suggestions`.

    const slotData = kid.suggestions
      ? kid.suggestions[slot]
      : { available: [], shop: [] };
    const hasShopSuggestion = slotData?.shop?.length > 0;
    const shopItem = hasShopSuggestion ? slotData.shop[0] : null;

    return (
      <View style={styles.slotContainer} key={slot}>
        <View style={styles.slotRow}>
          <Text style={styles.slotLabel}>{slot.toUpperCase()}</Text>
          <TouchableOpacity style={styles.slotAction}>
            <Text style={styles.slotPlaceholder}>+ ASSIGN COMPONENT</Text>
          </TouchableOpacity>
        </View>

        {/* Variety / Shopping Suggestion */}
        {hasShopSuggestion && (
          <TouchableOpacity
            style={styles.suggestionRow}
            onPress={() => addToShoppingList(shopItem.name)}
          >
            <ShoppingCart size={10} color={Theme.colors.secondary} />
            <Text style={styles.suggestionText}>
              {shopItem.msg.toUpperCase()}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderKidLunch = ({ item }) => (
    <GlassCard style={styles.card}>
      <View style={styles.kidHeader}>
        <User size={16} color={Theme.colors.secondary} />
        <Text style={styles.kidName}>{item.kidName.toUpperCase()}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.slotsContainer}>
        {/* If we have plan.lunches.slots from backend, use it. Else fallback. */}
        {(
          plan?.lunches?.slots || ["Main", "Fruit", "Snack", "Treat", "Drink"]
        ).map((slot) => renderLunchSlot(item, slot))}
      </View>
    </GlassCard>
  );

  if (loading && !plan) {
    return (
      <AuroraBackground>
        <View style={styles.center}>
          <ActivityIndicator color={Theme.colors.primary} size="large" />
          <Text style={styles.loadingText}>
            CALCULATING STRATEGIC VECTORS...
          </Text>
        </View>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>MEAL STRATEGIST</Text>
            <Text style={styles.subtitle}>TACTICAL NUTRITION ENGINE</Text>
          </View>
          <View style={styles.actions}>
            <View style={styles.budgetInputWrap}>
              <DollarSign size={12} color={Theme.colors.text.dimmed} />
              <TextInput
                style={styles.budgetInput}
                placeholder="BUDGET"
                placeholderTextColor={Theme.colors.text.dimmed}
                keyboardType="numeric"
                value={budget}
                onChangeText={setBudget}
              />
            </View>
            <TouchableOpacity
              onPress={generatePlan}
              disabled={loading}
              style={styles.refreshBtn}
            >
              <RefreshCw size={20} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "dinners" && styles.activeTab]}
            onPress={() => setActiveTab("dinners")}
          >
            <ChefHat
              size={16}
              color={
                activeTab === "dinners" ? "#000" : Theme.colors.text.dimmed
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "dinners" && styles.activeTabText,
              ]}
            >
              DINNER INTEL
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "lunches" && styles.activeTab]}
            onPress={() => setActiveTab("lunches")}
          >
            <User
              size={16}
              color={
                activeTab === "lunches" ? "#000" : Theme.colors.text.dimmed
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "lunches" && styles.activeTabText,
              ]}
            >
              KID LUNCH OPS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {plan ? (
          <FlatList
            data={
              activeTab === "dinners" ? plan.dinners : plan.lunches.templates
            }
            renderItem={
              activeTab === "dinners" ? renderDinnerItem : renderKidLunch
            }
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Info size={40} color={Theme.colors.text.dimmed} />
            <Text style={styles.emptyText}>NO STRATEGIC PLAN LOADED</Text>
          </View>
        )}
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === "ios" ? 60 : 40 },
  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
  },
  subtitle: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  refreshBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Theme.colors.primary,
  },
  tabText: {
    color: Theme.colors.text.dimmed,
    fontWeight: "800",
    fontSize: 13,
  },
  activeTabText: {
    color: "#000",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    padding: 20,
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  scoreText: {
    color: Theme.colors.success,
    fontSize: 13,
    fontWeight: "800",
  },
  costText: {
    color: Theme.colors.text.dimmed,
    fontSize: 14,
    fontWeight: "600",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mealTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statText: {
    color: Theme.colors.text.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  shoppingSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(217, 70, 239, 0.1)", // fuchsia-500/10
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  shoppingText: {
    color: Theme.colors.secondary,
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },
  briefing: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  briefingLabel: {
    color: Theme.colors.text.dimmed,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 6,
  },
  briefingText: {
    color: Theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  kidHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kidName: {
    color: Theme.colors.secondary,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  slotsContainer: {
    gap: 8,
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slotLabel: {
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "700",
    width: 70,
  },
  slotAction: {
    flex: 1,
    alignItems: "flex-end",
  },
  slotPlaceholder: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  slotContainer: {
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 8,
    borderRadius: 8,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 4,
  },
  suggestionText: {
    color: Theme.colors.secondary,
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "italic",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    opacity: 0.5,
  },
  emptyText: {
    color: Theme.colors.text.dimmed,
    fontSize: 15,
    fontWeight: "600",
  },
});
