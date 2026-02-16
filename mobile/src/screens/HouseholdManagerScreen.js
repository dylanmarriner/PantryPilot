import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  Home,
  UserPlus,
  PlusCircle,
  ChevronRight,
  LogOut,
  Shield,
  Users,
  X,
  CreditCard,
} from "lucide-react-native";
import { useApi } from "../services/api";
import { Theme } from "../styles/DesignSystem";
import GlassCard from "../components/GlassCard";
import AuroraBackground from "../components/AuroraBackground";

const HouseholdManagerScreen = ({ navigation, route }) => {
  const user = route.params?.user || {};
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const api = useApi();

  useEffect(() => {
    loadHouseholds();
  }, []);

  const loadHouseholds = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/users/${user.id}/households`);
      setHouseholds(data);
    } catch (error) {
      console.error("Failed to load households:", error);
    } finally {
      setLoading(false);
    }
  };

  const createHousehold = async () => {
    if (!newHouseholdName.trim()) {
      Alert.alert("PROTOCOL ERROR", "HOUSEHOLD NOMENCLATURE REQUIRED");
      return;
    }

    try {
      await api.post("/households", {
        name: newHouseholdName,
        timezone: "UTC",
        currency: "USD",
      });
      setModalVisible(false);
      setNewHouseholdName("");
      loadHouseholds();
      Alert.alert("SUCCESS", "NEW HOUSEHOLD SECTOR INITIALIZED");
    } catch (error) {
      Alert.alert("SYSTEM ERROR", "FAILED TO INITIALIZE HOUSEHOLD SECTOR");
    }
  };

  const joinHousehold = async () => {
    if (!joinCode.trim()) {
      Alert.alert("PROTOCOL ERROR", "ACCESS CODE REQUIRED");
      return;
    }

    try {
      await api.post("/households/join", {
        joinCode: joinCode.trim(),
      });
      setJoinModalVisible(false);
      setJoinCode("");
      loadHouseholds();
      Alert.alert("SUCCESS", "LINK ESTABLISHED WITH EXTERNAL HOUSEHOLD");
    } catch (error) {
      Alert.alert("SECURITY ERROR", "INVALID ACCESS CODE OR LINK REFUSED");
    }
  };

  const leaveHousehold = async (householdId) => {
    Alert.alert(
      "TERMINATE LINK",
      "CONFIRM DECOUPLING FROM THIS HOUSEHOLD SECTOR?",
      [
        { text: "CANCEL", style: "cancel" },
        {
          text: "DECOUPLE",
          style: "destructive",
          onPress: async () => {
            try {
              await api.post(`/households/${householdId}/leave`);
              loadHouseholds();
              Alert.alert("SUCCESS", "LINK TERMINATED");
            } catch (error) {
              Alert.alert("SYSTEM ERROR", "FAILED TO DECOUPLE FROM SECTOR");
            }
          },
        },
      ],
    );
  };

  const selectHousehold = (household) => {
    navigation.navigate("Dashboard", { household, user });
  };

  const renderHouseholdItem = ({ item }) => (
    <TouchableOpacity onPress={() => selectHousehold(item)}>
      <GlassCard style={styles.householdItem}>
        <View style={styles.householdInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.householdName}>{item.name.toUpperCase()}</Text>
            <View style={styles.roleBadge}>
              <Shield size={10} color={Theme.colors.primary} />
              <Text style={styles.roleText}>
                {item.UserHousehold?.role?.name || "MEMBER"}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Users size={12} color={Theme.colors.text.dimmed} />
              <Text style={styles.metaText}>{item.userCount || 1} NODES</Text>
            </View>
            <View style={styles.metaSeparator} />
            <View style={styles.metaItem}>
              <CreditCard size={12} color={Theme.colors.text.dimmed} />
              <Text style={styles.metaText}>
                {item.subscriptionTier?.toUpperCase() || "STANDARD"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.leaveBtnCell}
            onPress={() => leaveHousehold(item.id)}
          >
            <LogOut size={18} color={Theme.colors.error} />
          </TouchableOpacity>
          <ChevronRight size={20} color={Theme.colors.text.dimmed} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <AuroraBackground>
        <View style={styles.center}>
          <ActivityIndicator color={Theme.colors.primary} />
        </View>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>HOUSEHOLD CORE</Text>
            <Text style={styles.subtitle}>ACTIVE SECTOR MANAGEMENT</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setJoinModalVisible(true)}
              style={styles.headerBtn}
            >
              <UserPlus size={20} color={Theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.headerBtn}
            >
              <PlusCircle size={20} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={households}
          renderItem={renderHouseholdItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Home
                size={60}
                color={Theme.colors.text.dimmed}
                strokeWidth={1}
              />
              <Text style={styles.emptyText}>NO ACTIVE SECTORS FOUND</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.emptyBtnText}>INITIALIZE NEW CORE</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Create Modal */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalBackdrop}>
            <GlassCard style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>INITIALIZE CORE</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={20} color={Theme.colors.text.dimmed} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="SECTOR IDENTITY..."
                placeholderTextColor={Theme.colors.text.dimmed}
                value={newHouseholdName}
                onChangeText={setNewHouseholdName}
                autoFocus
              />
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={createHousehold}
              >
                <Text style={styles.submitBtnText}>CONFIRM INITIALIZATION</Text>
              </TouchableOpacity>
            </GlassCard>
          </View>
        </Modal>

        {/* Join Modal */}
        <Modal transparent visible={joinModalVisible} animationType="fade">
          <View style={styles.modalBackdrop}>
            <GlassCard style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>LINK SECTOR</Text>
                <TouchableOpacity onPress={() => setJoinModalVisible(false)}>
                  <X size={20} color={Theme.colors.text.dimmed} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="ACCESS CODE..."
                placeholderTextColor={Theme.colors.text.dimmed}
                value={joinCode}
                onChangeText={setJoinCode}
                autoFocus
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={joinHousehold}
              >
                <Text style={styles.submitBtnText}>ESTABLISH LINK</Text>
              </TouchableOpacity>
            </GlassCard>
          </View>
        </Modal>
      </View>
    </AuroraBackground>
  );
};

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
  headerActions: { flexDirection: "row", gap: 10 },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  listContent: { padding: 20, gap: 16 },
  householdItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  householdInfo: { flex: 1, gap: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  householdName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(34, 211, 238, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.2)",
  },
  roleText: {
    color: Theme.colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: {
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "600",
  },
  metaSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  actions: { flexDirection: "row", alignItems: "center", gap: 16 },
  leaveBtnCell: { padding: 4 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 120,
    gap: 24,
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
    backgroundColor: Theme.colors.primary,
  },
  emptyBtnText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { padding: 24, gap: 20 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    color: Theme.colors.primary,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
  input: {
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 14,
    paddingHorizontal: 18,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  submitBtn: {
    height: 50,
    backgroundColor: Theme.colors.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default HouseholdManagerScreen;
