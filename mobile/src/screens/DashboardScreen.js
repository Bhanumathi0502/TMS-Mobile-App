import React, { useCallback, useMemo, useState } from "react";

import {
  Alert,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import API from "../api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import Screen from "../components/Screen";
import StatCard from "../components/StatCard";
import AppCard from "../components/AppCard";


// =====================================================
// HELPERS
// =====================================================

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");


const isStaff = (role) => {
  const r = normalize(role);

  return (
    r.includes("staff") ||
    [
      "plumber",
      "electrician",
      "software developer",
    ].includes(r)
  );
};


// =====================================================
// DASHBOARD SCREEN
// =====================================================

export default function DashboardScreen({ navigation }) {

  const { user } = useAuth();
  const { colors } = useTheme();

  // ===================================================
  // STATE
  // ===================================================

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    closed: 0,
  });

  const [analytics, setAnalytics] = useState({
    byPriority: {},
    slaBreached: 0,
  });

  const [complaints, setComplaints] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");


  // ===================================================
  // ROLE
  // ===================================================

  const role = normalize(user?.role);

  const admin = role === "superadmin";

  const staff = isStaff(user?.role);


  // ===================================================
  // RECENT COMPLAINT TEXT
  // ===================================================

  const title = admin
    ? "Recent Complaints"
    : staff
      ? "My Recent Complaints"
      : "My Recent Complaints";

  const subtitle = admin
    ? "Latest complaints across the system"
    : staff
      ? "Latest complaints assigned to you"
      : "Latest complaints raised by you";


  // ===================================================
  // STATUS OPTIONS
  // ===================================================

  const statusOptions = [
    "All",
    "Pending",
    "Assigned",
    "In-Progress",
    "Onhold",
    "Completed",
  ];


  // ===================================================
  // LOAD DASHBOARD
  // ===================================================

  const load = useCallback(
    async (refresh = false) => {

      if (refresh) {
        setRefreshing(true);
      }

      try {

        const [
          dashboardResponse,
          complaintsResponse,
          analyticsResponse,
        ] = await Promise.all([

          API.get("/complaints/dashboard"),

          API.get("/complaints"),

          API.get("/complaints/analytics"),

        ]);


        // Dashboard stats
        setStats(
          dashboardResponse.data || {
            total: 0,
            pending: 0,
            assigned: 0,
            closed: 0,
          }
        );


        // Complaints
        setComplaints(
          Array.isArray(complaintsResponse.data)
            ? complaintsResponse.data
            : []
        );


        // Analytics
        setAnalytics(
          analyticsResponse.data || {
            byPriority: {},
            slaBreached: 0,
          }
        );

      } catch (error) {

        console.log(
          "Dashboard load error:",
          error?.response?.data ||
          error?.message
        );

        if (!refresh) {

          Alert.alert(
            "Dashboard",
            error?.response?.data?.message ||
            "Unable to load dashboard data"
          );

        }

      } finally {

        setRefreshing(false);

      }

    },
    []
  );


  // ===================================================
  // LOAD WHEN SCREEN OPENS
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load])
  );


  // ===================================================
  // PRIORITY DATA
  // ===================================================

  const priority = analytics.byPriority || {};

  const maxPriority = Math.max(
    1,
    ...Object.values(priority).map(Number)
  );

  const priorityRows = [
    "Critical",
    "High",
    "Medium",
    "Low",
  ];


  // ===================================================
  // STAT CARDS
  // ===================================================

  const statItems = useMemo(
    () => [
      {
        type: "total",
        label: "Total Complaints",
        value: stats.total,
      },
      {
        type: "pending",
        label: "Pending",
        value: stats.pending,
      },
      {
        type: "assigned",
        label: "Assigned",
        value: stats.assigned,
      },
      {
        type: "closed",
        label: "Closed",
        value: stats.closed,
      },
    ],
    [stats]
  );


  // ===================================================
  // FILTERED COMPLAINTS
  // ===================================================

  const filteredComplaints = useMemo(() => {

    if (
      !selectedStatus ||
      selectedStatus === "All"
    ) {
      return complaints;
    }

    return complaints.filter(
      (complaint) =>
        normalize(complaint.status) ===
        normalize(selectedStatus)
    );

  }, [
    complaints,
    selectedStatus,
  ]);


  // ===================================================
  // CLOSE FILTER
  // ===================================================

  const closeFilter = () => {
    setFilterOpen(false);
    setSelectedStatus("");
  };


  // ===================================================
  // SCREEN
  // ===================================================

  return (

    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          tintColor={colors.primary}
        />
      }
    >

      {/* =================================================
          DASHBOARD HEADER
      ================================================= */}

      <View style={styles.dashboardHeader}>

        <Image
          source={require("../../assets/dash.png")}
          style={styles.profileImage}
          resizeMode="contain"
        />

        <Text
          style={[
            styles.dashboardTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Complaint Dashboard
        </Text>

      </View>


      {/* =================================================
          WELCOME
      ================================================= */}

      <View style={styles.welcome}>

        <View style={styles.welcomeContent}>

          <Text style={styles.welcomeTitle}>
            Welcome back, {user?.name || "Admin"}
          </Text>

          <Text style={styles.welcomeRole}>
            {admin
              ? "Super Admin"
              : user?.role || "User"}
          </Text>

          <Text style={styles.welcomeSub}>
            Monitor and manage support complaints
          </Text>

        </View>


        <View style={styles.avatar}>

          <Text style={styles.avatarText}>
            {String(user?.name || "U")
              .charAt(0)
              .toUpperCase()}
          </Text>

        </View>

      </View>


      {/* =================================================
          COMPLAINT OVERVIEW
      ================================================= */}

      <View style={styles.overviewHeader}>

        <Text
          style={[
            styles.overviewTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Complaint Overview
        </Text>

        <Text
          style={[
            styles.overviewSub,
            {
              color: colors.muted,
            },
          ]}
        >
          Live counts from the service desk
        </Text>

      </View>


      {/* =================================================
          STAT CARDS
      ================================================= */}

      <View style={styles.grid}>

        {statItems.map((item, index) => (

          <View
            key={item.type}
            style={styles.gridItem}
          >

            <StatCard
              {...item}
              index={index}
            />

          </View>

        ))}

      </View>


      {/* =================================================
          PRIORITY OVERVIEW
      ================================================= */}

      <AppCard style={styles.analyticsCard}>

        <View style={styles.chartHeader}>

          <View style={styles.chartTitleContainer}>

            <Text
              style={[
                styles.chartTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Priority Overview
            </Text>

            <Text
              style={[
                styles.chartSub,
                {
                  color: colors.muted,
                },
              ]}
            >
              Current complaint distribution
            </Text>

          </View>


          <View
            style={[
              styles.slaBadge,
              {
                backgroundColor:
                  analytics.slaBreached
                    ? colors.dark
                      ? "#451A1A"
                      : "#FEF2F2"
                    : colors.dark
                      ? "#163326"
                      : "#F0FDF4",
              },
            ]}
          >

            <Text
              style={{
                color: analytics.slaBreached
                  ? "#DC2626"
                  : "#16A34A",
                fontSize: 11,
                fontWeight: "900",
              }}
            >
              {analytics.slaBreached || 0} SLA breached
            </Text>

          </View>

        </View>


        {priorityRows.map((label) => {

          const value = Number(
            priority[label] || 0
          );

          const width = `${Math.max(
            value ? 7 : 0,
            (value / maxPriority) * 100
          )}%`;

          return (

            <View
              key={label}
              style={styles.barRow}
            >

              <Text
                style={[
                  styles.barLabel,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {label}
              </Text>


              <View
                style={[
                  styles.barTrack,
                  {
                    backgroundColor:
                      colors.border,
                  },
                ]}
              >

                <View
                  style={[
                    styles.barFill,
                    {
                      width,
                      backgroundColor:
                        label === "Critical"
                          ? "#DC2626"
                          : colors.primary,
                    },
                  ]}
                />

              </View>


              <Text
                style={[
                  styles.barValue,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {value}
              </Text>

            </View>

          );

        })}

      </AppCard>


      {/* =================================================
          RECENT COMPLAINTS
      ================================================= */}

      <AppCard style={styles.recentComplaintsBox}>

        <View style={styles.sectionHeader}>

          <View style={styles.sectionTitleRow}>

            <Image
              source={require("../../assets/recentcomplaints.png")}
              style={styles.recentComplaintImage}
              resizeMode="contain"
            />


            <View style={styles.sectionTextContainer}>

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {title}
              </Text>

              <Text
                style={[
                  styles.sectionSub,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                {subtitle}
              </Text>

            </View>

          </View>


          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.viewButton,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
              },
            ]}
            onPress={() =>
              navigation.navigate(
                "Complaints",
                {
                  filter: "unassigned",
                }
              )
            }
          >

            <Text
              style={[
                styles.viewButtonText,
                {
                  color: colors.primary,
                },
              ]}
            >
              View All
            </Text>

            <Ionicons
              name="chevron-forward"
              size={15}
              color={colors.primary}
            />

          </TouchableOpacity>

        </View>

      </AppCard>


      {/* =================================================
          ADMIN FILTER
      ================================================= */}

      {admin && (

        <AppCard style={styles.filterBox}>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.filterHeader}
            onPress={() =>
              setFilterOpen(!filterOpen)
            }
          >

            <View style={styles.filterTitleRow}>

              {/* FILTER IMAGE */}

              <Image
                source={require("../../assets/search.png")}
                style={styles.filterImage}
                resizeMode="contain"
              />


              <View style={styles.filterTextContainer}>

                <Text
                  style={[
                    styles.filterTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Filter Complaints by Status
                </Text>


                <Text
                  style={[
                    styles.filterSub,
                    {
                      color: colors.muted,
                    },
                  ]}
                >
                  {selectedStatus
                    ? `${selectedStatus} complaints`
                    : "View complaints by status"}
                </Text>

              </View>

            </View>


            <Ionicons
              name={
                filterOpen
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={20}
              color={colors.muted}
            />

          </TouchableOpacity>


          {/* =================================================
              STATUS OPTIONS
          ================================================= */}

          {filterOpen && (

            <View style={styles.statusOptions}>

              {statusOptions.map(
                (status) => {

                  const active =
                    (status === "All" &&
                      !selectedStatus) ||
                    selectedStatus === status;


                  return (

                    <TouchableOpacity
                      key={status}
                      activeOpacity={0.8}
                      style={[
                        styles.statusButton,
                        {
                          backgroundColor:
                            active
                              ? colors.primary
                              : colors.input,

                          borderColor:
                            active
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                      onPress={() =>
                        setSelectedStatus(
                          status === "All"
                            ? ""
                            : status
                        )
                      }
                    >

                      <Text
                        style={[
                          styles.statusButtonText,
                          {
                            color: active
                              ? "#FFFFFF"
                              : colors.text,
                          },
                        ]}
                      >
                        {status}
                      </Text>

                    </TouchableOpacity>

                  );

                }
              )}

            </View>

          )}

        </AppCard>

      )}


      {/* =================================================
          FILTERED COMPLAINT RESULTS
      ================================================= */}

      {admin && filterOpen && (

        <View style={styles.filteredSection}>

          {/* RESULTS HEADER */}

          <View style={styles.filteredHeader}>

            <View style={{ flex: 1 }}>

              <Text
                style={[
                  styles.filteredTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {selectedStatus || "All"} Complaints
              </Text>


              <Text
                style={[
                  styles.filteredSub,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                {filteredComplaints.length} complaint
                {filteredComplaints.length === 1
                  ? ""
                  : "s"} found
              </Text>

            </View>


            {/* CLOSE BUTTON */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.closeFilterButton,
                {
                  backgroundColor:
                    colors.input,
                  borderColor:
                    colors.border,
                },
              ]}
              onPress={closeFilter}
            >

              <Ionicons
                name="close"
                size={17}
                color={colors.muted}
              />

              <Text
                style={[
                  styles.closeFilterText,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                Close
              </Text>

            </TouchableOpacity>

          </View>


          {/* =================================================
              COMPLAINT LIST
          ================================================= */}

          {filteredComplaints.length > 0 ? (

            filteredComplaints.map(
              (complaint) => (

                <TouchableOpacity
                  key={complaint._id}
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate(
                      "Complaint Details",
                      {
                        complaint,
                      }
                    )
                  }
                >

                  <AppCard
                    style={
                      styles.filteredComplaintCard
                    }
                  >

                    <View
                      style={
                        styles.filteredCardTop
                      }
                    >

                      <View
                        style={{ flex: 1 }}
                      >

                        <Text
                          style={[
                            styles.filteredComplaintType,
                            {
                              color: colors.text,
                            },
                          ]}
                        >
                          {complaint.complaintType ||
                            "Complaint"}
                        </Text>


                        <Text
                          style={[
                            styles.filteredComplaintId,
                            {
                              color: colors.muted,
                            },
                          ]}
                        >
                          #
                          {String(
                            complaint._id
                          )
                            .slice(-8)
                            .toUpperCase()}
                        </Text>

                      </View>


                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.muted}
                      />

                    </View>


                    <Text
                      numberOfLines={2}
                      style={[
                        styles.filteredRemarks,
                        {
                          color: colors.muted,
                        },
                      ]}
                    >
                      {complaint.remarks ||
                        "No remarks available"}
                    </Text>


                    <View
                      style={
                        styles.filteredMeta
                      }
                    >

                      <Text
                        style={[
                          styles.filteredMetaText,
                          {
                            color: colors.muted,
                          },
                        ]}
                      >
                        {complaint.priority ||
                          "Medium"}{" "}
                        priority
                      </Text>


                      <Text
                        style={[
                          styles.filteredMetaText,
                          {
                            color: colors.muted,
                          },
                        ]}
                      >
                        {complaint.assignee?.name ||
                          "Not assigned"}
                      </Text>

                    </View>

                  </AppCard>

                </TouchableOpacity>

              )
            )

          ) : (

            <AppCard>

              <View style={styles.noResults}>

                <Ionicons
                  name="file-tray-outline"
                  size={32}
                  color={colors.muted}
                />


                <Text
                  style={[
                    styles.noResultsTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  No complaints found
                </Text>


                <Text
                  style={[
                    styles.noResultsSub,
                    {
                      color: colors.muted,
                    },
                  ]}
                >
                  No complaints match this status.
                </Text>

              </View>

            </AppCard>

          )}

        </View>

      )}

    </Screen>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  // ===================================================
  // DASHBOARD HEADER
  // ===================================================

  dashboardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 12,
  },

  profileImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },

  dashboardTitle: {
    flex: 1,
    fontSize: 23,
    fontWeight: "900",
  },


  // ===================================================
  // WELCOME
  // ===================================================

  welcome: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  welcomeContent: {
    flex: 1,
  },

  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },

  welcomeRole: {
    color: "#BFDBFE",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },

  welcomeSub: {
    color: "#CBD5E1",
    fontSize: 11,
    marginTop: 7,
    lineHeight: 17,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#315D8A",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    borderWidth: 2,
    borderColor: "#93C5FD",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },


  // ===================================================
  // OVERVIEW
  // ===================================================

  overviewHeader: {
    marginBottom: 14,
  },

  overviewTitle: {
    fontSize: 22,
    fontWeight: "900",
  },

  overviewSub: {
    fontSize: 12,
    marginTop: 5,
  },


  // ===================================================
  // GRID
  // ===================================================

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  gridItem: {
    width: "48%",
  },


  // ===================================================
  // ANALYTICS
  // ===================================================

  analyticsCard: {
    marginTop: 8,
    marginBottom: 20,
  },

  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  chartTitleContainer: {
    flex: 1,
    marginRight: 8,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  chartSub: {
    fontSize: 10,
    marginTop: 3,
  },

  slaBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },

  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 11,
  },

  barLabel: {
    width: 62,
    fontSize: 11,
    fontWeight: "800",
  },

  barTrack: {
    flex: 1,
    height: 9,
    borderRadius: 5,
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: 5,
  },

  barValue: {
    width: 28,
    textAlign: "right",
    fontSize: 11,
    fontWeight: "900",
  },


  // ===================================================
  // RECENT COMPLAINTS
  // ===================================================

  recentComplaintsBox: {
    marginTop: 4,
    marginBottom: 18,
    padding: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  recentComplaintImage: {
    width: 42,
    height: 42,
    marginRight: 10,
  },

  sectionTextContainer: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
  },

  sectionSub: {
    fontSize: 10,
    marginTop: 3,
  },

  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 8,
  },

  viewButtonText: {
    fontSize: 11,
    fontWeight: "900",
  },


  // ===================================================
  // FILTER BOX
  // ===================================================

  filterBox: {
    marginTop: 0,
    marginBottom: 18,
    padding: 14,
  },

  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  // FILTER IMAGE
  filterImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },

  filterTextContainer: {
    flex: 1,
  },

  filterTitle: {
    fontSize: 14,
    fontWeight: "900",
  },

  filterSub: {
    fontSize: 10,
    marginTop: 3,
  },


  // ===================================================
  // STATUS OPTIONS
  // ===================================================

  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },

  statusButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  statusButtonText: {
    fontSize: 11,
    fontWeight: "800",
  },


  // ===================================================
  // FILTERED RESULTS
  // ===================================================

  filteredSection: {
    marginBottom: 20,
  },

  filteredHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  filteredTitle: {
    fontSize: 18,
    fontWeight: "900",
  },

  filteredSub: {
    fontSize: 10,
    marginTop: 3,
  },

  closeFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  closeFilterText: {
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 3,
  },


  // ===================================================
  // FILTERED COMPLAINT CARD
  // ===================================================

  filteredComplaintCard: {
    marginBottom: 10,
    padding: 14,
  },

  filteredCardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  filteredComplaintType: {
    fontSize: 15,
    fontWeight: "900",
  },

  filteredComplaintId: {
    fontSize: 9,
    marginTop: 3,
    fontWeight: "700",
  },

  filteredRemarks: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  filteredMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 9,
  },

  filteredMetaText: {
    fontSize: 10,
    fontWeight: "700",
  },


  // ===================================================
  // NO RESULTS
  // ===================================================

  noResults: {
    alignItems: "center",
    paddingVertical: 24,
  },

  noResultsTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginTop: 8,
  },

  noResultsSub: {
    fontSize: 11,
    marginTop: 3,
  },

});