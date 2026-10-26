import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";


// =====================================================
// SETTINGS SCREEN
// =====================================================

export default function SettingsScreen({ navigation }) {

  const { dark, colors, toggle } = useTheme();
  const { user, updateUser } = useAuth();
  const [notifications, setNotifications] = useState(user?.notificationsEnabled !== false);
  const [savingNotifications, setSavingNotifications] = useState(false);


  // =====================================================
  // Keep the setting in sync when the authenticated user is refreshed.
  // =====================================================

  useEffect(() => {

    setNotifications(user?.notificationsEnabled !== false);
  }, [user?.notificationsEnabled]);


  // =====================================================
  // NOTIFICATION TOGGLE
  // =====================================================

  const notify = async (value) => {

    try {
      setSavingNotifications(true);
      await API.put("/auth/notification-preference", { enabled: value });
      setNotifications(value);
      await updateUser({ ...user, notificationsEnabled: value });
    } catch (error) {
      Alert.alert("Settings", error.response?.data?.message || "Unable to update notification preference");
    } finally {
      setSavingNotifications(false);
    }
  };


  // =====================================================
  // SCREEN
  // =====================================================

  return (

    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* =================================================
          PREFERENCES
      ================================================= */}

      <Text
        style={[
          styles.section,
          {
            color: colors.text,
          },
        ]}
      >
        Preferences
      </Text>


      {/* =================================================
          NOTIFICATIONS - SEPARATE CARD
      ================================================= */}

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >

        <Setting
          colors={colors}
          icon="notifications-outline"
          title="Notifications"
          subtitle="Receive complaint updates"
        >

          <Switch
            value={notifications}
            onValueChange={notify}
            disabled={savingNotifications}
            trackColor={{
              false: "#CBD5E1",
              true: "#93C5FD",
            }}
            thumbColor={
              notifications
                ? colors.primary
                : "#F8FAFC"
            }
          />

        </Setting>

      </View>


      {/* =================================================
          APPEARANCE - SEPARATE CARD
      ================================================= */}

      <View
        style={[
          styles.card,
          styles.appearanceCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >

        <Setting
          colors={colors}
          icon={dark ? "moon" : "sunny-outline"}
          title="Appearance"
          subtitle={
            dark
              ? "Dark mode enabled"
              : "Light mode enabled"
          }
        >

          <Switch
            value={dark}
            onValueChange={toggle}
            trackColor={{
              false: "#CBD5E1",
              true: "#93C5FD",
            }}
            thumbColor={
              dark
                ? colors.primary
                : "#F8FAFC"
            }
          />

        </Setting>

      </View>


      {/* =================================================
          SECURITY
      ================================================= */}

      <Text
        style={[
          styles.section,
          {
            color: colors.text,
          },
        ]}
      >
        Security
      </Text>


      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >

        <Action
          colors={colors}
          icon="lock-closed-outline"
          title="Change Password"
          subtitle="Update your account password"
          onPress={() =>
            navigation.navigate("Change Password")
          }
        />

      </View>


      {/* =================================================
          ABOUT
      ================================================= */}

      <Text
        style={[
          styles.section,
          {
            color: colors.text,
          },
        ]}
      >
        About
      </Text>


      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >

        <Action
          colors={colors}
          icon="information-circle-outline"
          title="About Application"
          subtitle="TMS • Version 2.2"
          onPress={() =>
            Alert.alert(
              "TMS",
              "Ticket Management System\nVersion 2.2"
            )
          }
        />

      </View>

    </ScrollView>
  );
}


// =====================================================
// SETTING COMPONENT
// =====================================================

function Setting({
  colors,
  icon,
  title,
  subtitle,
  children,
}) {

  return (

    <View style={styles.row}>

      {/* ICON */}

      <View
        style={[
          styles.icon,
          {
            backgroundColor: colors.input,
          },
        ]}
      >

        <Ionicons
          name={icon}
          size={20}
          color={colors.primary}
        />

      </View>


      {/* TEXT */}

      <View style={styles.body}>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          {title}
        </Text>


        <Text
          style={[
            styles.subtitle,
            {
              color: colors.muted,
            },
          ]}
        >
          {subtitle}
        </Text>

      </View>


      {/* SWITCH */}

      {children}

    </View>
  );
}


// =====================================================
// ACTION COMPONENT
// =====================================================

function Action({
  colors,
  icon,
  title,
  subtitle,
  onPress,
}) {

  return (

    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.8}
    >

      {/* ICON */}

      <View
        style={[
          styles.icon,
          {
            backgroundColor: colors.input,
          },
        ]}
      >

        <Ionicons
          name={icon}
          size={20}
          color={colors.primary}
        />

      </View>


      {/* TEXT */}

      <View style={styles.body}>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          {title}
        </Text>


        <Text
          style={[
            styles.subtitle,
            {
              color: colors.muted,
            },
          ]}
        >
          {subtitle}
        </Text>

      </View>


      {/* ARROW */}

      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.muted}
      />

    </TouchableOpacity>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  // ===================================================
  // CONTAINER
  // ===================================================

  container: {
    flex: 1,
  },


  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 50,
  },


  // ===================================================
  // SECTION TITLE
  // ===================================================

  section: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 8,
    marginBottom: 12,
  },


  // ===================================================
  // CARD
  // ===================================================

  card: {
    borderRadius: 17,
    paddingHorizontal: 15,
    borderWidth: 1,
    marginBottom: 20,
  },


  // Appearance cardಗೆ extra spacing
  appearanceCard: {
    marginTop: 0,
    marginBottom: 28,
  },


  // ===================================================
  // ROW
  // ===================================================

  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
  },


  // ===================================================
  // ICON
  // ===================================================

  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },


  // ===================================================
  // BODY
  // ===================================================

  body: {
    flex: 1,
  },


  title: {
    fontSize: 14,
    fontWeight: "900",
  },


  subtitle: {
    fontSize: 10,
    marginTop: 4,
  },

});