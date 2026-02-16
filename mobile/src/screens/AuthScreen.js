import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  ArrowRight,
  Fingerprint,
} from "lucide-react-native";
import { useAuth } from "../services/auth";
import { Theme } from "../styles/DesignSystem";
import AuroraBackground from "../components/AuroraBackground";

const { width } = Dimensions.get("window");

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("SYNC ERROR", "CREDENTIALS REQUIRED FOR NEURAL LINK");
      return;
    }

    if (isSignUp && (!firstName || !lastName)) {
      Alert.alert("SYNC ERROR", "IDENTITY PARAMETERS INCOMPLETE");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const userData = { email, password, firstName, lastName };
        const user = await signUp(userData);
        navigation.navigate("HouseholdManager", { user });
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      Alert.alert("PROTOCOL DENIED", error.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={40} color={Theme.colors.primary} />
            </View>
            <Text style={styles.title}>PANTRYPILOT</Text>
            <Text style={styles.gateLabel}>SECURE GATEWAY v2.0</Text>
          </View>

          {/* Auth Card */}
          <View style={styles.authCard}>
            <Text style={styles.cardTitle}>
              {isSignUp ? "CREATE NEW ACCOUNT" : "SIGN IN"}
            </Text>

            {isSignUp && (
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <User
                    size={18}
                    color={Theme.colors.text.dimmed}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor={Theme.colors.text.dimmed}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <User
                    size={18}
                    color={Theme.colors.text.dimmed}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor={Theme.colors.text.dimmed}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Mail
                size={18}
                color={Theme.colors.text.dimmed}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={Theme.colors.text.dimmed}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Lock
                size={18}
                color={Theme.colors.text.dimmed}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Theme.colors.text.dimmed}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.background} />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    {isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
                  </Text>
                  <ArrowRight size={20} color={Theme.colors.background} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsSignUp(!isSignUp)}
              style={styles.switchLink}
            >
              <Text style={styles.linkText}>
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Biometric Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.biometricBtn}>
              <Fingerprint size={28} color={Theme.colors.text.dimmed} />
              <Text style={styles.biometricLabel}>BIOMETRIC LOGIN</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34, 211, 238, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 4,
  },
  gateLabel: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 6,
    opacity: 0.8,
  },
  authCard: {
    backgroundColor: "rgba(24, 24, 27, 0.7)",
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 24,
    gap: 16,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    minHeight: 56,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  button: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Theme.colors.background,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  switchLink: {
    marginTop: 4,
    alignItems: "center",
    paddingVertical: 8,
  },
  linkText: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  biometricBtn: {
    alignItems: "center",
    gap: 8,
    opacity: 0.5,
  },
  biometricLabel: {
    color: Theme.colors.text.dimmed,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
});
