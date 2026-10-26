import React, { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import API from "../api";

import {
  Modal,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from "react-native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";

import DashboardScreen from "../screens/DashboardScreen";
import ComplaintsListScreen from "../screens/ComplaintsListScreen";
import RaiseComplaintScreen from "../screens/RaiseComplaintScreen";
import MastersScreen from "../screens/MastersScreen";
import MasterFormScreen from "../screens/MasterFormScreen";
import ReportsScreen from "../screens/ReportsScreen";
import ComplaintDetailsScreen from "../screens/ComplaintDetailsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

const Stack = createNativeStackNavigator();


// =====================================================
// DASHBOARD MENU
// =====================================================

function DashboardMenu({
  navigation,
  isAdmin,
  canRaise,
  logout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { colors } = useTheme();
  const openScreen = (screen) => {
    setMenuOpen(false);
    navigation.navigate(screen);
  };


  // ===================================================
  // LOAD NOTIFICATION COUNT
  // ===================================================

  const loadUnread = useCallback(async () => {
    try {
      const { data } =
        await API.get("/notifications");

      setUnread(
        Number(data?.unread || 0)
      );

    } catch (error) {
      console.log("Unread count load failed", error?.response?.data || error?.message);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadUnread();
  }, [loadUnread]));


  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {
    setMenuOpen(false);

    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Logout",
          style: "destructive",

          onPress: async () => {

            try {
              await logout();

            } catch (error) {

              console.log(
                "Logout error:",
                error
              );

            }

          },
        },
      ]
    );
  };


  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setMenuOpen(true)}
        style={styles.menuButton}
      >
        <Text style={[styles.menuIcon, { color: colors.text }]}>☰</Text>
      </TouchableOpacity>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={() => setMenuOpen(false)}
        >
          <ScrollView
            style={[
              styles.menuBox,
              {
                top: insets.top + 52,
                maxHeight: screenHeight - insets.top - 68,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >


            {/* =================================================
                MASTER SCREENS - ADMIN ONLY
            ================================================= */}

            {isAdmin && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.menuItem}

                onPress={() => {
                  openScreen("Masters");
                }}
              >

                <View
                  style={styles.menuRow}
                >

                  <Ionicons
                    name="grid-outline"
                    size={22}
                    color={colors.primary}
                  />

                  <Text
                    style={[
                      styles.menuText,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    Master Screens
                  </Text>

                </View>

              </TouchableOpacity>
            )}


            {/* =================================================
                RAISE COMPLAINT - ADMIN + USER
            ================================================= */}

            {canRaise && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.menuItem}

                onPress={() => {
                  openScreen("Raise Complaint");
                }}
              >

                <View
                  style={styles.menuRow}
                >

                  <Ionicons
                    name="create-outline"
                    size={22}
                    color={colors.primary}
                  />

                  <Text
                    style={[
                      styles.menuText,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    Raise Complaint
                  </Text>

                </View>

              </TouchableOpacity>
            )}


            {/* =================================================
                ALL COMPLAINTS - ADMIN + USER
            ================================================= */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.menuItem}

              onPress={() => {
                openScreen("Complaints");
              }}
            >

              <View
                style={styles.menuRow}
              >

                <Ionicons
                  name="list-outline"
                  size={22}
                  color={colors.primary}
                />

                <Text
                  style={[
                    styles.menuText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  All Complaints
                </Text>

              </View>

            </TouchableOpacity>


            {/* =================================================
                ANALYTICS - ADMIN ONLY
            ================================================= */}

            {isAdmin && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.menuItem}

                onPress={() => {
                  openScreen("Analytics");
                }}
              >

                <View
                  style={styles.menuRow}
                >

                  <Ionicons
                    name="analytics-outline"
                    size={22}
                    color={colors.primary}
                  />

                  <Text
                    style={[
                      styles.menuText,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    Analytics
                  </Text>

                </View>

              </TouchableOpacity>
            )}


            {/* =================================================
                REPORTS - ADMIN ONLY
            ================================================= */}

            {isAdmin && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.menuItem}

                onPress={() => {
                  openScreen("Reports");
                }}
              >

                <View
                  style={styles.menuRow}
                >

                  <Ionicons
                    name="bar-chart-outline"
                    size={22}
                    color={colors.primary}
                  />

                  <Text
                    style={[
                      styles.menuText,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    Reports
                  </Text>

                </View>

              </TouchableOpacity>
            )}


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.menuItem}

              onPress={() => {
                openScreen("Notifications");
              }}
            >

              <View
                style={styles.menuRow}
              >

                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={colors.primary}
                />

                <Text
                  style={[
                    styles.menuText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Notifications
                </Text>


                {unread > 0 ? (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          colors.primary,
                      },
                    ]}
                  >

                    <Text
                      style={
                        styles.badgeText
                      }
                    >
                      {unread > 99
                        ? "99+"
                        : unread}
                    </Text>

                  </View>
                ) : null}

              </View>

            </TouchableOpacity>


            {/* =================================================
                DIVIDER
            ================================================= */}

            <View
              style={styles.menuDivider}
            />


            {/* =================================================
                PROFILE
            ================================================= */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.menuItem}

              onPress={() => {
                openScreen("Profile");
              }}
            >

              <View
                style={styles.menuRow}
              >

                <Ionicons
                  name="person-outline"
                  size={22}
                  color={colors.primary}
                />

                <Text
                  style={[
                    styles.menuText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Profile
                </Text>

              </View>

            </TouchableOpacity>


            {/* =================================================
                SETTINGS
            ================================================= */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.menuItem}

              onPress={() => {
                openScreen("Settings");
              }}
            >

              <View
                style={styles.menuRow}
              >

                <Ionicons
                  name="settings"
                  size={22}
                  color={colors.primary}
                />

                <Text
                  style={[
                    styles.menuText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Settings
                </Text>

              </View>

            </TouchableOpacity>


            {/* =================================================
                LOGOUT
            ================================================= */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.menuItem}
              onPress={handleLogout}
            >

              <View
                style={styles.menuRow}
              >

                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color="#DC2626"
                />

                <Text
                  style={[
                    styles.menuText,
                    {
                      color:
                        "#DC2626",
                    },
                  ]}
                >
                  Logout
                </Text>

              </View>

            </TouchableOpacity>

          </ScrollView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}


// =====================================================
// APP NAVIGATOR
// =====================================================

export default function AppNavigator() {

  const { colors } = useTheme();

  const {
    user,
    logout,
  } = useAuth();


  const role = String(
    user?.role || ""
  ).toLowerCase();


  const isAdmin =
    role === "superadmin";


  const canRaise =
    isAdmin ||
    role === "user";


  return (

    <Stack.Navigator
      screenOptions={{
        headerTitleStyle: {
          fontWeight: "800",
        },

        headerTintColor:
          colors.text,

        headerStyle: {
          backgroundColor:
            colors.surface,
        },

        contentStyle: {
          backgroundColor:
            colors.background,
        },
      }}
    >


      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={({ navigation }) => ({
          title: "Dashboard",
          headerLeft: () => (
            <DashboardMenu
              navigation={navigation}
              isAdmin={isAdmin}
              canRaise={canRaise}
              logout={logout}
            />
          ),
          headerRight: () => (
            <TouchableOpacity
              accessibilityLabel="Settings"
              accessibilityRole="button"
              onPress={() => navigation.navigate("Settings")}
              style={styles.settingsButton}
            >
              <Ionicons
                name="settings"
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Complaints" component={ComplaintsListScreen} />
      <Stack.Screen name="Complaint Details" component={ComplaintDetailsScreen} />
      {canRaise && <Stack.Screen name="Raise Complaint" component={RaiseComplaintScreen} />}
      {isAdmin && <Stack.Screen name="Masters" component={MastersScreen} />}
      {isAdmin && <Stack.Screen name="Master Form" component={MasterFormScreen} />}
      {isAdmin && <Stack.Screen name="Reports" component={ReportsScreen} />}
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notifications" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
      <Stack.Screen name="Edit Profile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
      <Stack.Screen name="Change Password" component={ChangePasswordScreen} options={{ title: "Change Password" }} />

    </Stack.Navigator>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  menuButton: {
    width: 40,
    height: 40,
    marginLeft: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  menuIcon: {
    fontSize: 24,
    fontWeight: "800",
  },

  settingsButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },

  menuBox: {
    position: "absolute",
    left: 8,
    width: 235,
    borderRadius: 14,
    paddingVertical: 6,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 10,
  },

  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 6,
    marginHorizontal: 12,
  },


  menuText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 12,
  },


  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: "auto",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },


  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
  },

});