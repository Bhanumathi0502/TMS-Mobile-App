import React, {
  useCallback,
  useState,
} from "react";

import {
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useFocusEffect,
} from "@react-navigation/native";

import {
  Ionicons,
} from "@expo/vector-icons";

import API from "../api";

import Screen from "../components/Screen";

import AppCard from "../components/AppCard";

import {
  useTheme,
} from "../context/ThemeContext";


// =====================================================
// NOTIFICATIONS SCREEN
// =====================================================

export default function NotificationsScreen() {

  const { colors } = useTheme();

  const [items, setItems] =
    useState([]);

  const [refreshing, setRefreshing] =
    useState(false);


  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const load = useCallback(
    async () => {

      setRefreshing(true);

      try {

        const { data } =
          await API.get(
            "/notifications"
          );

        setItems(
          Array.isArray(data?.data)
            ? data.data
            : []
        );

      } catch (error) {

        console.log(
          "NOTIFICATIONS LOAD ERROR:",
          error?.response?.data ||
          error?.message
        );

        Alert.alert(
          "Notifications",
          error?.response?.data?.message ||
            "Unable to load notifications"
        );

      } finally {

        setRefreshing(false);

      }
    },
    []
  );


  // =====================================================
  // LOAD WHEN SCREEN OPENS
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );


  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markAsRead = async (id) => {

    try {

      await API.put(
        `/notifications/${id}/read`
      );

      setItems((previous) =>
        previous.map(
          (notification) =>
            notification._id === id
              ? {
                  ...notification,
                  read: true,
                }
              : notification
        )
      );

    } catch (error) {

      console.log(
        "MARK READ ERROR:",
        error?.response?.data ||
        error?.message
      );

    }
  };


  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {

    try {

      await API.put(
        "/notifications/read-all"
      );

      setItems((previous) =>
        previous.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        )
      );

    } catch (error) {

      console.log(
        "MARK ALL READ ERROR:",
        error?.response?.data ||
        error?.message
      );

      Alert.alert(
        "Notifications",
        error?.response?.data?.message ||
          "Unable to mark notifications as read"
      );
    }
  };


  // =====================================================
  // CHECK UNREAD
  // =====================================================

  const hasUnread = items.some(
    (notification) =>
      !notification.read
  );


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={load}
          tintColor={
            colors.primary
          }
        />
      }
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <View
        style={styles.header}
      >

        <View
          style={styles.headerContent}
        >

          <Text
            style={[
              styles.title,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Notifications
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  colors.muted,
              },
            ]}
          >
            Complaint updates and
            system alerts
          </Text>

        </View>


        {/* MARK ALL */}

        {hasUnread && (

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={
              markAllAsRead
            }
          >

            <Text
              style={[
                styles.markAll,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              Mark all read
            </Text>

          </TouchableOpacity>

        )}

      </View>


      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {items.length === 0 ? (

        <AppCard
          style={styles.emptyCard}
        >

          <View
            style={styles.emptyContent}
          >

            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor:
                    colors.input,
                },
              ]}
            >

              <Ionicons
                name="notifications-off-outline"
                size={28}
                color={
                  colors.muted
                }
              />

            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              No Notifications
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    colors.muted,
                },
              ]}
            >
              You're all caught up.
            </Text>

          </View>

        </AppCard>

      ) : (

        /* =================================================
            NOTIFICATION LIST
        ================================================= */

        items.map(
          (notification) => {

            const isRead =
              notification.read === true;

            return (

              <TouchableOpacity
                key={
                  notification._id
                }
                activeOpacity={0.85}
                onPress={() =>
                  markAsRead(
                    notification._id
                  )
                }
              >

                <AppCard
                  style={[
                    styles.card,
                    {
                      backgroundColor:
                        colors.surface,

                      borderColor:
                        isRead
                          ? colors.border
                          : colors.primary,
                    },
                  ]}
                >

                  {/* ICON */}

                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor:
                          colors.input,
                      },
                    ]}
                  >

                    <Ionicons
                      name={
                        isRead
                          ? "notifications-outline"
                          : "notifications"
                      }
                      size={21}
                      color={
                        colors.primary
                      }
                    />

                  </View>


                  {/* CONTENT */}

                  <View
                    style={
                      styles.body
                    }
                  >

                    <View
                      style={
                        styles.titleRow
                      }
                    >

                      <Text
                        style={[
                          styles.itemTitle,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {notification.title ||
                          "Notification"}
                      </Text>


                      {!isRead && (

                        <View
                          style={[
                            styles.unreadDot,
                            {
                              backgroundColor:
                                colors.primary,
                            },
                          ]}
                        />

                      )}

                    </View>


                    <Text
                      style={[
                        styles.message,
                        {
                          color:
                            colors.muted,
                        },
                      ]}
                    >
                      {notification.message ||
                        "No message"}
                    </Text>


                    <Text
                      style={[
                        styles.time,
                        {
                          color:
                            colors.muted,
                        },
                      ]}
                    >
                      {notification.createdAt
                        ? new Date(
                            notification.createdAt
                          ).toLocaleString()
                        : "-"}
                    </Text>

                  </View>

                </AppCard>

              </TouchableOpacity>

            );
          }
        )

      )}

    </Screen>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        16,
    },


    headerContent: {
      flex: 1,

      paddingRight:
        12,
    },


    title: {
      fontSize: 27,

      fontWeight:
        "900",
    },


    subtitle: {
      fontSize: 12,

      marginTop: 4,
    },


    markAll: {
      fontSize: 11,

      fontWeight:
        "900",
    },


    card: {
      flexDirection:
        "row",

      padding: 14,

      marginBottom: 10,

      borderWidth: 1,

      borderRadius: 16,
    },


    iconContainer: {
      width: 44,

      height: 44,

      borderRadius: 13,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight: 12,
    },


    body: {
      flex: 1,
    },


    titleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    itemTitle: {
      flex: 1,

      fontSize: 14,

      fontWeight:
        "900",

      paddingRight: 8,
    },


    unreadDot: {
      width: 8,

      height: 8,

      borderRadius: 4,
    },


    message: {
      fontSize: 12,

      lineHeight: 18,

      marginTop: 5,
    },


    time: {
      fontSize: 10,

      marginTop: 7,
    },


    emptyCard: {
      marginTop: 10,
    },


    emptyContent: {
      alignItems:
        "center",

      justifyContent:
        "center",

      paddingVertical: 30,
    },


    emptyIcon: {
      width: 58,

      height: 58,

      borderRadius: 18,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom: 12,
    },


    emptyTitle: {
      fontSize: 16,

      fontWeight:
        "900",

      marginBottom: 5,
    },


    emptyText: {
      fontSize: 12,
    },

  });