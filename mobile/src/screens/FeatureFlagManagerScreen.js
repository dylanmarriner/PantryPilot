import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiService } from "../services/api";

const FeatureFlagManagerScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState([]);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/admin/feature-flags");
      setFlags(response.data);
    } catch (error) {
      console.error("Failed to fetch flags:", error);
      Alert.alert("Error", "Failed to load feature flags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const toggleFlag = async (flagId, currentValue) => {
    try {
      const newValue = !currentValue;
      // Optimistic update
      setFlags((prevFlags) =>
        prevFlags.map((f) =>
          f.id === flagId ? { ...f, isEnabled: newValue } : f,
        ),
      );

      await apiService.post(`/admin/feature-flags/${flagId}/toggle`, {
        enabled: newValue,
      });
    } catch (error) {
      console.error("Failed to toggle flag:", error);
      Alert.alert("Error", "Failed to update feature flag");
      // Rollback optimistic update
      fetchFlags();
    }
  };

  const renderFlagItem = ({ item }) => (
    <View style={styles.flagItem}>
      <View style={styles.flagInfo}>
        <Text style={styles.flagName}>{item.name}</Text>
        <Text style={styles.flagDescription}>{item.description}</Text>
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.badge,
              { backgroundColor: item.isGlobal ? "#FF9500" : "#007AFF" },
            ]}
          >
            <Text style={styles.badgeText}>
              {item.isGlobal ? "Global" : "Household"}
            </Text>
          </View>
        </View>
      </View>
      <Switch
        trackColor={{ false: "#767577", true: "#34C759" }}
        thumbColor={item.isEnabled ? "#FFFFFF" : "#f4f3f4"}
        onValueChange={() => toggleFlag(item.id, item.isEnabled)}
        value={item.isEnabled}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Feature Flags</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={flags}
        renderItem={renderFlagItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="flag-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>No feature flags defined</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={16} color="#8E8E93" />
        <Text style={styles.footerText}>
          Toggling global flags affects all households immediately. Use with
          caution.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  title: { fontSize: 20, fontWeight: "bold" },
  list: { padding: 16 },
  flagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flagInfo: { flex: 1, marginRight: 16 },
  flagName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  flagDescription: { fontSize: 14, color: "#8E8E93", marginBottom: 8 },
  badgeContainer: { flexDirection: "row" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "bold" },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: "#8E8E93" },
  footer: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
});

export default FeatureFlagManagerScreen;
