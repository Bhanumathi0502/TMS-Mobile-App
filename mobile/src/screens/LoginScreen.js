import React, { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";


export default function LoginScreen({ navigation }) {

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);


  // =====================================================
  // LOGIN
  // =====================================================

  const submit = async () => {

    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Validation",
        "Please enter email and password"
      );
      return;
    }

    try {

      setBusy(true);

      await login(
        email.trim(),
        password
      );

    } catch (e) {

      Alert.alert(
        "Login Failed",
        e?.response?.data?.message ||
          "Unable to login. Please check your credentials."
      );

    } finally {

      setBusy(false);

    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* =================================================
              TOP ABSTRACT DESIGN
          ================================================= */}

          <View style={styles.hero}>

            {/* Main blue shape */}

            <View style={styles.blueShape} />

            {/* Purple shape */}

            <View style={styles.purpleShape} />

            {/* Light circle */}

            <View style={styles.lightCircle} />

            {/* Small circle */}

            <View style={styles.dot} />


            {/* =================================================
                FLOATING ICON
            ================================================= */}

            <View style={styles.iconShadow}>

              <View style={styles.iconBox}>

                <Ionicons
                  name="person-outline"
                  size={43}
                  color="#3158C7"
                />

              </View>

            </View>


            {/* =================================================
                TITLE
            ================================================= */}

            <Text style={styles.title}>
              Login
            </Text>

          </View>


          {/* =================================================
              FORM
          ================================================= */}

          <View style={styles.form}>

            {/* EMAIL */}

            <Text style={styles.label}>
              Email
            </Text>

            <View style={styles.inputContainer}>

              <View style={styles.iconCircle}>

                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#3158C7"
                />

              </View>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#A1AAB8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />

            </View>


            {/* PASSWORD */}

            <Text style={styles.label}>
              Password
            </Text>

            <View style={styles.inputContainer}>

              <View style={styles.iconCircle}>

                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#3158C7"
                />

              </View>

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#A1AAB8"
                secureTextEntry={!showPassword}
                style={styles.input}
              />


              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.eyeButton}
                onPress={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
              >

                <Ionicons
                  name={
                    showPassword
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={20}
                  color="#64748B"
                />

              </TouchableOpacity>

            </View>


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <TouchableOpacity
  activeOpacity={0.88}
  disabled={busy}
  onPress={submit}
  style={[
    styles.loginButton,
    busy && styles.loginDisabled,
  ]}
>
  <Text style={styles.loginText}>
    {busy ? "Logging in..." : "Login"}
  </Text>
</TouchableOpacity>


            {/* =================================================
                BOTTOM LINKS
            ================================================= */}

            <View style={styles.links}>


              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate(
                    "Bootstrap SuperAdmin"
                  )
                }
              >

                <Text style={styles.link}>
                   First-time Super Admin Setup
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  keyboard: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
  },


  // =======================================================
  // HERO
  // =======================================================

  hero: {
    height: 350,

    position: "relative",

    overflow: "hidden",

    alignItems: "center",

    justifyContent: "flex-end",

    paddingBottom: 28,
  },


  // =======================================================
  // BLUE SHAPE
  // =======================================================

  blueShape: {
    position: "absolute",

    width: 430,
    height: 330,

    borderRadius: 210,

    backgroundColor: "#4775E6",

    top: -190,

    left: -115,

    transform: [
      {
        rotate: "-8deg",
      },
    ],
  },


  // =======================================================
  // PURPLE SHAPE
  // =======================================================

  purpleShape: {
    position: "absolute",

    width: 330,
    height: 330,

    borderRadius: 180,

    backgroundColor: "#6C5CE7",

    top: -145,

    right: -150,

    opacity: 0.95,
  },


  // =======================================================
  // LIGHT CIRCLE
  // =======================================================

  lightCircle: {
    position: "absolute",

    width: 145,
    height: 145,

    borderRadius: 80,

    backgroundColor: "#DDE7FF",

    top: 70,

    left: -80,

    opacity: 0.8,
  },


  // =======================================================
  // DOT
  // =======================================================

  dot: {
    position: "absolute",

    width: 15,
    height: 15,

    borderRadius: 8,

    backgroundColor: "#FFFFFF",

    right: 30,

    top: 95,

    opacity: 0.8,
  },


  // =======================================================
  // ICON
  // =======================================================

  iconShadow: {
    width: 104,
    height: 104,

    borderRadius: 25,

    backgroundColor: "rgba(0,0,0,0.08)",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 15,

    zIndex: 5,
  },

  iconBox: {
    width: 96,
    height: 96,

    borderRadius: 23,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#1E3A8A",

    shadowOpacity: 0.18,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 8,
  },


  // =======================================================
  // TITLE
  // =======================================================

  title: {
    color: "#111827",

    fontSize: 28,

    fontWeight: "900",

    zIndex: 5,
  },


  // =======================================================
  // FORM
  // =======================================================

  form: {
    flex: 1,

    paddingHorizontal: 28,

    paddingTop: 20,

    paddingBottom: 30,
  },


  // =======================================================
  // LABEL
  // =======================================================

  label: {
    color: "#334155",

    fontSize: 12,

    fontWeight: "700",

    marginBottom: 7,

    marginLeft: 2,
  },


  // =======================================================
  // INPUT
  // =======================================================

  inputContainer: {
    height: 58,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: "#CBD5E1",

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 9,

    marginBottom: 19,
  },

  iconCircle: {
    width: 39,
    height: 39,

    borderRadius: 12,

    backgroundColor: "#EEF3FF",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  input: {
    flex: 1,

    height: "100%",

    color: "#111827",

    fontSize: 14,

    fontWeight: "500",
  },

  eyeButton: {
    width: 40,
    height: 40,

    alignItems: "center",
    justifyContent: "center",
  },


  // =======================================================
  // LOGIN BUTTON
  // =======================================================

  loginButton: {
    height: 57,

    borderRadius: 14,

    backgroundColor: "#163E67",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 7,

    shadowColor: "#163E67",

    shadowOpacity: 0.2,

    shadowRadius: 9,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 5,
  },

  loginDisabled: {
    opacity: 0.65,
  },

  loginText: {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "800",
  textAlign: "center",
},



  // =======================================================
  // LINKS
  // =======================================================

  links: {
  alignItems: "center",
  justifyContent: "center",
  marginTop: 25,
},

  link: {
    color: "#475569",

    fontSize: 12,

    fontWeight: "500",

    textDecorationLine: "underline",
  },

});