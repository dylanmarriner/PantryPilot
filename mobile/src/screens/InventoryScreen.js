import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Package,
  MapPin,
  Calendar,
  ChevronRight,
  Info,
} from "lucide-react-native";
import { useApi } from "../services/api";
import { Theme } from "../styles/DesignSystem";
import GlassCard from "../components/GlassCard";
import AuroraBackground from "../components/AuroraBackground";

const { width } = Dimensions.get("window");

const CATEGORIES = [
  "All",
  "Dairy",
  "Produce",
  "Meat",
  "Grains",
  "Snacks",
  "Other",
];
const LOCATIONS = ["All", "Fridge", "Pantry", "Freezer", "Cupboard"];

export default function InventoryScreen({ navigation }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const api = useApi();

  const fetchInventory = async () => {
    try {
      const data = await api.get("/inventory");
      setInventory(data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesLocation =
        selectedLocation === "All" || item.location === selectedLocation;
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [inventory, searchQuery, selectedCategory, selectedLocation]);

  const renderItem = ({ item }) => {
    const isExpiring =
      new Date(item.expiryDate) <
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    if (viewMode === "grid") {
      return (
        <TouchableOpacity
          style={styles.gridItemContainer}
          onPress={() => navigation.navigate("ItemDetails", { item })}
        >
          <GlassCard style={styles.gridItem}>
            <View
              style={[
                styles.gridImageContainer,
                {
                  backgroundColor: isExpiring
                    ? "rgba(217, 70, 239, 0.1)"
                    : "rgba(34, 211, 238, 0.1)",
                },
              ]}
            >
              <Package
                size={32}
                color={
                  isExpiring ? Theme.colors.secondary : Theme.colors.primary
                }
              />
            </View>
            <Text style={styles.gridTitle} numberOfLines={1}>
              {item.name.toUpperCase()}
            </Text>
            <View style={styles.gridMeta}>
              <Text style={styles.gridQty}>
                {item.quantity} {item.unit}
              </Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isExpiring
                      ? Theme.colors.secondary
                      : Theme.colors.success,
                  },
                ]}
              />
            </View>
          </GlassCard>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.listItemContainer}
        onPress={() => navigation.navigate("ItemDetails", { item })}
      >
        <GlassCard style={styles.listItem}>
          <View
            style={[
              styles.listIconContainer,
              {
                backgroundColor: isExpiring
                  ? "rgba(217, 70, 239, 0.1)"
                  : "rgba(34, 211, 238, 0.1)",
              },
            ]}
          >
            <Package
              size={20}
              color={isExpiring ? Theme.colors.secondary : Theme.colors.primary}
            />
          </View>
          <View style={styles.listContent}>
            <Text style={styles.listTitle}>{item.name.toUpperCase()}</Text>
            <View style={styles.listSubContent}>
              <View style={styles.metaItem}>
                <MapPin size={10} color={Theme.colors.text.dimmed} />
                <Text style={styles.metaText}>
                  {item.location.toUpperCase()}
                </Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Text
                  style={[styles.metaText, { color: Theme.colors.primary }]}
                >
                  {item.quantity} {item.unit.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.listRight}>
            <Text
              style={[
                styles.expiryText,
                {
                  color: isExpiring
                    ? Theme.colors.secondary
                    : Theme.colors.text.primary,
                },
              ]}
            >
              {Math.ceil(
                (new Date(item.expiryDate) - new Date()) /
                  (1000 * 60 * 60 * 24),
              )}
              d
            </Text>
            <Text style={styles.expiryLabel}>TTL</Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <AuroraBackground>
      <View style={styles.container}>
        {/* Header & Search */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>VAULT OPERATIONS</Text>
          <View style={styles.searchContainer}>
            <Search
              size={18}
              color={Theme.colors.text.dimmed}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="SEARCH ASSETS..."
              placeholderTextColor={Theme.colors.text.dimmed}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* View Toggle & Filters */}
        <View style={styles.controls}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.filterChip,
                  selectedLocation === loc && styles.filterChipActive,
                ]}
                onPress={() => setSelectedLocation(loc)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedLocation === loc && styles.filterChipTextActive,
                  ]}
                >
                  {loc.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              onPress={() => setViewMode("list")}
              style={[
                styles.toggleBtn,
                viewMode === "list" && styles.toggleBtnActive,
              ]}
            >
              <List
                size={18}
                color={
                  viewMode === "list"
                    ? Theme.colors.background
                    : Theme.colors.text.secondary
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode("grid")}
              style={[
                styles.toggleBtn,
                viewMode === "grid" && styles.toggleBtnActive,
              ]}
            >
              <LayoutGrid
                size={18}
                color={
                  viewMode === "grid"
                    ? Theme.colors.background
                    : Theme.colors.text.secondary
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Inventory List */}
        <FlatList
          data={filteredInventory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          key={viewMode} // Re-render when view mode changes
          numColumns={viewMode === "grid" ? 2 : 1}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Info size={48} color={Theme.colors.text.dimmed} />
              <Text style={styles.emptyText}>NO ASSETS MATCHING CRITERIA</Text>
            </View>
          }
        />

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddItem")}
        >
          <Plus size={32} color={Theme.colors.background} />
        </TouchableOpacity>
      </View>
    </AuroraBackground>
  );
}

// End of file

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  headerTitle: {
    color: Theme.colors.text.primary,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: Theme.spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    height: 50,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Theme.colors.text.primary,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    gap: 12,
  },
  filterScroll: {
    gap: 8,
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  filterChipText: {
    color: Theme.colors.text.secondary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  filterChipTextActive: {
    color: Theme.colors.background,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    padding: 8,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: Theme.colors.text.primary,
  },
  listContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 120,
  },
  listItemContainer: {
    marginBottom: Theme.spacing.md,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.md,
    gap: 12,
  },
  listIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  listTitle: {
    color: Theme.colors.text.primary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  listSubContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: Theme.colors.text.dimmed,
    fontSize: 12,
    fontWeight: "600",
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Theme.colors.text.dimmed,
    opacity: 0.3,
  },
  listRight: {
    alignItems: "flex-end",
  },
  expiryText: {
    fontSize: 14,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  expiryLabel: {
    color: Theme.colors.text.dimmed,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  gridItemContainer: {
    width: (width - Theme.spacing.lg * 2 - Theme.spacing.md) / 2,
    marginBottom: Theme.spacing.md,
    marginRight: Theme.spacing.md,
  },
  gridItem: {
    padding: Theme.spacing.md,
    alignItems: "center",
  },
  gridImageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  gridTitle: {
    color: Theme.colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  gridMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gridQty: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.text.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    color: Theme.colors.text.dimmed,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
