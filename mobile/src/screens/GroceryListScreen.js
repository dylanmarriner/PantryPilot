import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  ShoppingCart,
  CheckCircle,
  Package,
  RefreshCw,
  Plus,
} from "lucide-react-native";
import { useApi } from "../services/api";
import { Theme } from "../styles/DesignSystem";
import GlassCard from "../components/GlassCard";
import AuroraBackground from "../components/AuroraBackground";

export default function GroceryListScreen() {
  const [groceryList, setGroceryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const api = useApi();

  const loadGroceryList = async () => {
    try {
      const data = await api.get("/grocery-list");
      setGroceryList(data);
    } catch (error) {
      console.error("Failed to load grocery list:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateGroceryList = async () => {
    try {
      setLoading(true);
      const data = await api.post("/grocery-list/generate");
      setGroceryList(data);
    } catch (error) {
      console.error("Failed to generate grocery list:", error);
      Alert.alert(
        "SYNC ERROR",
        "REMOTE CORE FAILED TO GENERATE LOGISTICS LIST",
      );
    } finally {
      setLoading(false);
    }
  };

  const markItemPurchased = async (itemId) => {
    try {
      await api.put(`/grocery-list/${itemId}`, { purchased: true });
      loadGroceryList();
    } catch (error) {
      console.error("Failed to mark item as purchased:", error);
      Alert.alert("SYSTEM ERROR", "FAILED TO COMMUTE PURCHASE TO VAULT");
    }
  };

  useEffect(() => {
    loadGroceryList();
  }, []);

  const groupItemsByCategory = (items) => {
    const grouped = {};
    items.forEach((item) => {
      const category = item.category?.toUpperCase() || "GENERAL";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });
    return grouped;
  };

  const renderGroceryItem = ({ item }) => (
    <GlassCard
      style={[styles.itemCard, item.purchased && styles.itemPurchased]}
    >
      <View style={styles.itemMain}>
        <View style={styles.itemHeader}>
          <Text
            style={[styles.itemName, item.purchased && styles.strikethrough]}
          >
            {item.name.toUpperCase()}
          </Text>
          {item.priority === "high" && !item.purchased && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>CORE</Text>
            </View>
          )}
        </View>
        <Text style={styles.itemMeta}>
          {item.quantity} {item.unit} ·{" "}
          {item.category?.toUpperCase() || "ASSET"}
        </Text>
      </View>

      {!item.purchased ? (
        <TouchableOpacity
          style={styles.checkBtn}
          onPress={() => markItemPurchased(item.id)}
        >
          <Plus size={20} color={Theme.colors.primary} />
        </TouchableOpacity>
      ) : (
        <CheckCircle size={20} color={Theme.colors.success} />
      )}
    </GlassCard>
  );

  const renderCategory = ({ item }) => {
    const [category, items] = item;
    return (
      <View style={styles.categoryWrap}>
        <Text style={styles.categoryTitle}>{category}</Text>
        {items.map((it) => (
          <View key={it.id}>{renderGroceryItem({ item: it })}</View>
        ))}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <AuroraBackground>
        <View style={styles.center}>
          <ActivityIndicator color={Theme.colors.primary} />
        </View>
      </AuroraBackground>
    );
  }

  const groupedActive = groupItemsByCategory(
    groceryList.filter((i) => !i.purchased),
  );
  const purchasedItems = groceryList.filter((i) => i.purchased);

  return (
    <AuroraBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>LOGISTICS LIST</Text>
            <Text style={styles.subtitle}>ACQUISITION PROTOCOL ACTIVE</Text>
          </View>
          <TouchableOpacity style={styles.genBtn} onPress={generateGroceryList}>
            <RefreshCw size={16} color="#000" />
            <Text style={styles.genBtnText}>SYNC</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={Object.entries(groupedActive)}
          renderItem={renderCategory}
          keyExtractor={(item) => item[0]}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefres={loadGroceryList}
              tintColor={Theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <ShoppingCart
                size={48}
                color={Theme.colors.text.dimmed}
                strokeWidth={1}
              />
              <Text style={styles.emptyText}>NO PENDING ACQUISITIONS</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={generateGroceryList}
              >
                <Text style={styles.emptyBtnText}>INITIATE SCAN</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            purchasedItems.length > 0 ? (
              <View style={styles.purchasedSection}>
                <View style={[styles.categoryWrap, { opacity: 0.6 }]}>
                  <Text style={styles.categoryTitle}>ACQUIRED ASSETS</Text>
                  {purchasedItems.map((it) => (
                    <View key={it.id}>{renderGroceryItem({ item: it })}</View>
                  ))}
                </View>
              </View>
            ) : null
          }
        />
        <View style={{ height: 80 }} />
      </View>
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
    alignItems: "center",
  },
  title: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 4,
  },
  subtitle: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 4,
  },
  genBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  genBtnText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  listContent: { padding: 20 },
  categoryWrap: { marginBottom: 28, gap: 12 },
  categoryTitle: {
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginLeft: 4,
    marginBottom: 6,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  itemPurchased: { opacity: 0.6 },
  itemMain: { flex: 1, gap: 4 },
  itemHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: Theme.colors.text.dimmed,
  },
  itemMeta: {
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "600",
  },
  priorityBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  priorityText: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(34, 211, 238, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    gap: 20,
  },
  emptyText: {
    color: Theme.colors.text.dimmed,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(34, 211, 238, 0.05)",
  },
  emptyBtnText: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  purchasedSection: { marginTop: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
