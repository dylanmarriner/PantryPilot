import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ScanLine,
  Box,
  Save,
  X,
  ChevronRight,
  Package,
  Info,
} from "lucide-react-native";
import { useApi } from "../services/api";
import { Theme } from "../styles/DesignSystem";
import GlassCard from "../components/GlassCard";
import AuroraBackground from "../components/AuroraBackground";

export default function AddItemScreen() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("Pantry");
  const [category, setCategory] = useState("Other");
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const api = useApi();

  // Handle data from Scanner
  useEffect(() => {
    if (route.params?.scanned) {
      const { suggestedName, barcode, photoUri } = route.params;
      if (suggestedName) setName(suggestedName);

      if (barcode) {
        resolveBarcode(barcode);
      }
    }
  }, [route.params]);

  const resolveBarcode = async (barcode) => {
    setResolving(true);
    try {
      // Calling our new vision API
      const product = await api.post("/ai/scan", { barcode });
      if (product.status !== "not_found") {
        setName(product.name.toUpperCase());
        setCategory(product.category);
        if (product.brand)
          setName(
            `${product.brand.toUpperCase()} - ${product.name.toUpperCase()}`,
          );
      }
    } catch (error) {
      console.error("Barcode resolution failed:", error);
    } finally {
      setResolving(false);
    }
  };

  const handleAddItem = async () => {
    if (!name || !quantity || !unit) {
      Alert.alert(
        "PROTOCOL ERROR",
        "ALL CORE FIELDS (NAME, QTY, UNIT) ARE MANDATORY",
      );
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        name,
        quantity: parseInt(quantity),
        unit,
        price: price ? Math.round(parseFloat(price) * 100) : 0,
        location,
        category,
        expiryDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(), // Default 30 days
      };

      await api.post("/inventory", itemData);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to log asset:", error);
      Alert.alert("SYSTEM ERROR", "FAILED TO LOG ASSET TO VAULT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
          >
            <X size={24} color={Theme.colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>LOG ASSET</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            style={styles.scanTrigger}
            onPress={() => navigation.navigate("Scanner")}
          >
            <GlassCard style={styles.scanCard}>
              <View style={styles.scanIconContainer}>
                <ScanLine size={24} color={Theme.colors.primary} />
              </View>
              <View style={styles.scanTextContainer}>
                <Text style={styles.scanTitle}>SCAN PRODUCT</Text>
                <Text style={styles.scanSubtitle}>
                  AUTO-POPULATE VIA VISION LINK
                </Text>
              </View>
              <ChevronRight size={18} color={Theme.colors.text.dimmed} />
            </GlassCard>
          </TouchableOpacity>

          <GlassCard style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ASSET IDENTITY</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="NOMENCLATURE..."
                  placeholderTextColor={Theme.colors.text.dimmed}
                />
                {resolving && (
                  <ActivityIndicator
                    size="small"
                    color={Theme.colors.primary}
                    style={styles.inlineLoader}
                  />
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>QUANTITY</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="QTY"
                  placeholderTextColor={Theme.colors.text.dimmed}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1.5 }]}>
                <Text style={styles.label}>UNIT</Text>
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="UNIT (L, KG, PC)"
                  placeholderTextColor={Theme.colors.text.dimmed}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>LOGISTICS LOCATION</Text>
              <View style={styles.locationSelector}>
                {["FRIDGE", "PANTRY", "FREEZER"].map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={[
                      styles.locBtn,
                      location.toUpperCase() === loc && styles.locBtnActive,
                    ]}
                    onPress={() => setLocation(loc)}
                  >
                    <Text
                      style={[
                        styles.locBtnText,
                        location.toUpperCase() === loc &&
                          styles.locBtnTextActive,
                      ]}
                    >
                      {loc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>VALUATION (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor={Theme.colors.text.dimmed}
                keyboardType="decimal-pad"
              />
            </View>
          </GlassCard>

          <View style={styles.infoBox}>
            <Info size={14} color={Theme.colors.primary} />
            <Text style={styles.infoText}>
              ASSETS LOGGED TO VAULT ARE TRACKED VIA T.O.M. REAL-TIME
              MONITORING.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleAddItem}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Theme.colors.background} />
            ) : (
              <>
                <Save size={20} color={Theme.colors.background} />
                <Text style={styles.submitBtnText}>COMMIT TO VAULT</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: Theme.spacing.md,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
  },
  closeBtn: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 60,
  },
  scanTrigger: {
    marginBottom: Theme.spacing.lg,
  },
  scanCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.md,
    backgroundColor: "rgba(34, 211, 238, 0.05)",
    borderColor: "rgba(34, 211, 238, 0.2)",
  },
  scanIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(34, 211, 238, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.md,
  },
  scanTextContainer: {
    flex: 1,
  },
  scanTitle: {
    color: Theme.colors.primary,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  scanSubtitle: {
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  formCard: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.lg,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: Theme.colors.text.dimmed,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 14,
    paddingHorizontal: 18,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  inlineLoader: {
    position: "absolute",
    right: 12,
  },
  row: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  locationSelector: {
    flexDirection: "row",
    gap: 8,
  },
  locBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  locBtnActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  locBtnText: {
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  locBtnTextActive: {
    color: Theme.colors.background,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  submitBtn: {
    marginTop: Theme.spacing.xl,
    height: 60,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: Theme.colors.background,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
