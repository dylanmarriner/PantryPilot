import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Mic, Send, Info, ChevronLeft } from "lucide-react-native";
import VoiceInput from "../components/VoiceInput";
import { useApi } from "../services/api";
import { Theme } from "../styles/DesignSystem";
import GlassCard from "../components/GlassCard";
import AuroraBackground from "../components/AuroraBackground";

export default function LogTodayScreen() {
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const api = useApi();

  const handleLogSubmit = async (text) => {
    if (!text.trim()) {
      Alert.alert("PROTOCOL ERROR", "INPUT BUFFER EMPTY. DATA REQUIRED.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/logs", { text: text.trim() });
      Alert.alert("SUCCESS", "DATA LOGGED TO CENTRAL CORE");
      setTextInput("");
    } catch (error) {
      console.error("Failed to submit log:", error);
      Alert.alert("SYNC ERROR", "FAILED TO COMMUTE DATA TO VAULT");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = (transcript) => {
    setTextInput(transcript);
  };

  return (
    <AuroraBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>LOG TODAY</Text>
            <Text style={styles.subtitle}>
              DAILY ASSET & CONSUMPTION TELEMETRY
            </Text>
          </View>

          <GlassCard style={styles.inputCard}>
            <Text style={styles.label}>TELEMETRY INPUT</Text>
            <TextInput
              style={styles.textInput}
              value={textInput}
              onChangeText={setTextInput}
              placeholder="e.g., 'CONSUMED 2 EGGS' or 'PURCHASED 1L MILK'..."
              placeholderTextColor={Theme.colors.text.dimmed}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.voiceRow}>
              <View style={styles.voiceInfo}>
                <Mic size={14} color={Theme.colors.primary} />
                <Text style={styles.voiceLabel}>NEURAL VOICE LINK ACTIVE</Text>
              </View>
              <VoiceInput onResult={handleVoiceResult} />
            </View>
          </GlassCard>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={() => handleLogSubmit(textInput)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Send size={18} color="#000" />
                <Text style={styles.submitButtonText}>COMMIT TO VAULT</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.examplesCard}>
            <View style={styles.exampleHeader}>
              <Info size={14} color={Theme.colors.text.dimmed} />
              <Text style={styles.exampleLabel}>PROTOCOL EXAMPLES</Text>
            </View>
            <Text style={styles.exampleText}>• "ATE 2 EGGS FOR BREAKFAST"</Text>
            <Text style={styles.exampleText}>
              • "USED 500ML MILK FOR COFFEE"
            </Text>
            <Text style={styles.exampleText}>
              • "BOUGHT 1KG CHICKEN BREAST"
            </Text>
            <Text style={styles.exampleText}>• "EXHAUSTED LOAF OF BREAD"</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 4,
  },
  subtitle: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 6,
  },
  inputCard: { padding: 20, gap: 16 },
  label: {
    color: Theme.colors.text.dimmed,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    padding: 16,
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  voiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  voiceInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  voiceLabel: {
    color: Theme.colors.text.dimmed,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  submitButton: {
    backgroundColor: Theme.colors.primary,
    height: 60,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  submitButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
  examplesCard: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    gap: 8,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  exampleLabel: {
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  exampleText: {
    color: Theme.colors.text.dimmed,
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.8,
  },
});
