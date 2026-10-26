import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import API from "../api";
import { useTheme } from "../context/ThemeContext";
import AppCard from "../components/AppCard";

// ======================================================
// HELPERS
// ======================================================

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");

const getStatus = (c) => normalize(c?.status);

const getType = (c) =>
  c?.complaintType || c?.type || "Other";

const getDepartment = (c) =>
  c?.department?.name ||
  c?.departmentName ||
  "Unknown";

const getStaff = (c) =>
  c?.assignee?.name ||
  c?.assignedTo?.name ||
  "Unassigned";

const getDate = (c) => {
  const value =
    c?.createdAt ||
    c?.created_at ||
    c?.date;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

// ======================================================
// COLORS
// ======================================================

const trendColors = [
  "#3B82F6",
  "#6366F1",
  "#14B8A6",
  "#F59E0B",
  "#EF4444",
];

const departmentColors = [
  "#14B8A6",
  "#8B5CF6",
  "#F59E0B",
  "#3B82F6",
  "#EF4444",
];

const categoryColors = [
  "#6366F1",
  "#3B82F6",
  "#14B8A6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
];

// ======================================================
// MAIN
// ======================================================

export default function AnalyticsScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [complaints, setComplaints] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [period, setPeriod] = useState("30 Days");
  const [periodOpen, setPeriodOpen] = useState(false);

  // ====================================================
  // LOAD
  // ====================================================

  const loadAnalytics = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      }

      try {
        const response =
          await API.get("/complaints");

        setComplaints(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        console.log(
          "Analytics Error:",
          error?.response?.data ||
            error?.message
        );

        if (!refresh) {
          Alert.alert(
            "Analytics",
            error?.response?.data?.message ||
              "Unable to load analytics"
          );
        }
      } finally {
        setRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      loadAnalytics(false);
    }, [loadAnalytics])
  );

  // ====================================================
  // DATE FILTER
  // ====================================================

  const filteredComplaints = useMemo(() => {
    let days = 30;

    if (period === "7 Days") days = 7;
    if (period === "90 Days") days = 90;

    const now = new Date();
    const start = new Date(now);

    start.setDate(
      now.getDate() - days
    );

    return complaints.filter((complaint) => {
      const date = getDate(complaint);

      if (!date) return true;

      return date >= start;
    });
  }, [complaints, period]);

  const total = filteredComplaints.length;

  // ====================================================
  // STATUS
  // ====================================================

  const statusCounts = useMemo(() => {
    const result = {
      pending: 0,
      assigned: 0,
      progress: 0,
      onhold: 0,
      completed: 0,
    };

    filteredComplaints.forEach((c) => {
      const status = getStatus(c);

      if (status === "pending") {
        result.pending++;
      } else if (status === "assigned") {
        result.assigned++;
      } else if (
        status === "in progress"
      ) {
        result.progress++;
      } else if (
        status === "onhold" ||
        status === "on hold"
      ) {
        result.onhold++;
      } else if (
        status === "completed" ||
        status === "closed"
      ) {
        result.completed++;
      }
    });

    return result;
  }, [filteredComplaints]);

  // ====================================================
  // TREND
  // ====================================================

  const trendData = useMemo(() => {
    const now = new Date();
    const result = [];

    for (let i = 4; i >= 0; i--) {
      const end = new Date(now);

      end.setDate(
        now.getDate() - i * 7
      );

      const start = new Date(end);

      start.setDate(
        end.getDate() - 6
      );

      const count =
        filteredComplaints.filter(
          (c) => {
            const date = getDate(c);

            if (!date) return false;

            return (
              date >= start &&
              date <= end
            );
          }
        ).length;

      result.push({
        label:
          `${end.getDate()}/${end.getMonth() + 1}`,
        value: count,
      });
    }

    return result;
  }, [filteredComplaints]);

  const maxTrend = Math.max(
    1,
    ...trendData.map(
      (x) => x.value
    )
  );

  // ====================================================
  // CATEGORY
  // ====================================================

  const categoryData = useMemo(() => {
    const map = {};

    filteredComplaints.forEach((c) => {
      const type = getType(c);

      map[type] =
        (map[type] || 0) + 1;
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [filteredComplaints]);

  const maxCategory = Math.max(
    1,
    ...categoryData.map(
      (x) => x[1]
    )
  );

  // ====================================================
  // DEPARTMENT
  // ====================================================

  const departmentData = useMemo(() => {
    const map = {};

    filteredComplaints.forEach((c) => {
      const department =
        getDepartment(c);

      map[department] =
        (map[department] || 0) + 1;
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filteredComplaints]);

  const maxDepartment = Math.max(
    1,
    ...departmentData.map(
      (x) => x[1]
    )
  );

  // ====================================================
  // STAFF
  // ====================================================

  const staffData = useMemo(() => {
    const map = {};

    filteredComplaints.forEach((c) => {
      const staff = getStaff(c);

      if (staff === "Unassigned") {
        return;
      }

      if (!map[staff]) {
        map[staff] = {
          assigned: 0,
          completed: 0,
        };
      }

      map[staff].assigned++;

      if (
        ["completed", "closed"].includes(
          getStatus(c)
        )
      ) {
        map[staff].completed++;
      }
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        ...value,
      }))
      .sort(
        (a, b) =>
          b.assigned - a.assigned
      )
      .slice(0, 5);
  }, [filteredComplaints]);

  const maxStaff = Math.max(
    1,
    ...staffData.map(
      (x) => x.assigned
    )
  );

  // ====================================================
  // PENDING AGE
  // ====================================================

  const pendingAgeData = useMemo(() => {
    const result = {
      "0-1 Days": 0,
      "2-3 Days": 0,
      "4-7 Days": 0,
      "7+ Days": 0,
    };

    const now = new Date();

    filteredComplaints.forEach((c) => {
      if (
        ["completed", "closed"].includes(
          getStatus(c)
        )
      ) {
        return;
      }

      const date = getDate(c);

      if (!date) return;

      const days =
        (now - date) /
        (1000 * 60 * 60 * 24);

      if (days <= 1) {
        result["0-1 Days"]++;
      } else if (days <= 3) {
        result["2-3 Days"]++;
      } else if (days <= 7) {
        result["4-7 Days"]++;
      } else {
        result["7+ Days"]++;
      }
    });

    return Object.entries(result);
  }, [filteredComplaints]);

  const maxPendingAge = Math.max(
    1,
    ...pendingAgeData.map(
      (x) => x[1]
    )
  );

  // ====================================================
  // STATUS DATA
  // ====================================================

  const statusData = [
    {
      label: "Pending",
      value: statusCounts.pending,
      color: "#F59E0B",
    },
    {
      label: "Assigned",
      value: statusCounts.assigned,
      color: "#3B82F6",
    },
    {
      label: "In-Progress",
      value: statusCounts.progress,
      color: "#6366F1",
    },
    {
      label: "Onhold",
      value: statusCounts.onhold,
      color: "#F97316",
    },
    {
      label: "Completed",
      value: statusCounts.completed,
      color: "#22C55E",
    },
  ];

  const maxStatus = Math.max(
    1,
    ...statusData.map(
      (x) => x.value
    )
  );

  const completionRate =
    total > 0
      ? Math.round(
          (statusCounts.completed /
            total) *
            100
        )
      : 0;

  const highestDepartment =
    departmentData.length
      ? departmentData[0][0]
      : "No data";

  // ====================================================
  // UI
  // ====================================================

  return (
    <SafeAreaView
      edges={[
        "top",
        "left",
        "right",
      ]}
      style={[
        styles.safeArea,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadAnalytics(true)
            }
            tintColor={
              colors.primary
            }
          />
        }
        contentContainerStyle={{
          paddingBottom:
            30 + insets.bottom,
        }}
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <View
          style={styles.header}
        >

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color={
                colors.text
              }
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.headerTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Analytics
          </Text>

        </View>

        {/* ==========================================
            SAME DIVIDER LIKE RAISE COMPLAINT
        ========================================== */}

        <View
          style={[
            styles.headerDivider,
            {
              backgroundColor:
                colors.border,
            },
          ]}
        />

        {/* ==========================================
            ANALYTICS OVERVIEW
        ========================================== */}

        <View
          style={styles.overviewRow}
        >

          <View
            style={styles.overviewLeft}
          >

            <Image
              source={require("../../assets/analytics3.png")}
              style={
                styles.analyticsImage
              }
              resizeMode="contain"
            />

            <View>
              <Text
                style={[
                  styles.overviewTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Analytics Overview
              </Text>

              <Text
                style={[
                  styles.overviewSubtitle,
                  {
                    color:
                      colors.muted,
                  },
                ]}
              >
                Complaint performance overview
              </Text>
            </View>

          </View>

          {/* SMALL DATE */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setPeriodOpen(true)
            }
            style={[
              styles.dateButton,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  "#2563EB",
              },
            ]}
          >

            <Ionicons
              name="calendar-outline"
              size={13}
              color="#2563EB"
            />

            <Text
              style={[
                styles.dateText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {period}
            </Text>

            <Ionicons
              name="chevron-down"
              size={11}
              color="#2563EB"
            />

          </TouchableOpacity>

        </View>

        {/* ==========================================
            SUMMARY
        ========================================== */}

        <View
          style={styles.summaryGrid}
        >

          <SummaryCard
            icon="documents-outline"
            title="Total"
            value={total}
            colors={colors}
          />

          <SummaryCard
            icon="time-outline"
            title="Pending"
            value={
              statusCounts.pending
            }
            colors={colors}
          />

          <SummaryCard
            icon="person-outline"
            title="Assigned"
            value={
              statusCounts.assigned
            }
            colors={colors}
          />

          <SummaryCard
            icon="checkmark-circle-outline"
            title="Completed"
            value={
              statusCounts.completed
            }
            colors={colors}
          />

        </View>

        {/* ==========================================
            01 COMPLAINT TREND
        ========================================== */}

        <ChartCard
          number="01"
          title="Complaint Trend"
          subtitle="Weekly complaint volume"
        >

          <View
            style={
              styles.trendChart
            }
          >

            {trendData.map(
              (item, index) => {

                const height =
                  item.value === 0
                    ? 8
                    : Math.max(
                        14,
                        (item.value /
                          maxTrend) *
                          125
                      );

                return (
                  <View
                    key={index}
                    style={
                      styles.trendColumn
                    }
                  >

                    <Text
                      style={[
                        styles.valueText,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {item.value}
                    </Text>

                    <View
                      style={[
                        styles.trendBar,
                        {
                          height,
                          backgroundColor:
                            trendColors[
                              index %
                                trendColors.length
                            ],
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.axisText,
                        {
                          color:
                            colors.muted,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>

                  </View>
                );
              }
            )}

          </View>

        </ChartCard>

        {/* ==========================================
            02 CATEGORY
        ========================================== */}

        <ChartCard
          number="02"
          title="Complaint Categories"
          subtitle="Most common complaint types"
        >

          {categoryData.map(
            ([label, value], index) => (
              <HorizontalBar
                key={label}
                label={label}
                value={value}
                max={maxCategory}
                color={
                  categoryColors[
                    index %
                      categoryColors.length
                  ]
                }
                colors={colors}
              />
            )
          )}

          {!categoryData.length && (
            <EmptyState
              colors={colors}
              message="No category data"
            />
          )}

        </ChartCard>

        {/* ==========================================
            03 DEPARTMENT
        ========================================== */}

        <ChartCard
          number="03"
          title="Department Performance"
          subtitle="Complaints by department"
        >

          <View
            style={
              styles.departmentChart
            }
          >

            {departmentData.map(
              ([label, value], index) => {

                const height =
                  Math.max(
                    14,
                    (value /
                      maxDepartment) *
                      125
                  );

                return (
                  <View
                    key={label}
                    style={
                      styles.departmentColumn
                    }
                  >

                    <Text
                      style={[
                        styles.valueText,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {value}
                    </Text>

                    <View
                      style={[
                        styles.departmentBar,
                        {
                          height,
                          backgroundColor:
                            departmentColors[
                              index %
                                departmentColors.length
                            ],
                        },
                      ]}
                    />

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.departmentLabel,
                        {
                          color:
                            colors.muted,
                        },
                      ]}
                    >
                      {label}
                    </Text>

                  </View>
                );
              }
            )}

          </View>

        </ChartCard>

        {/* ==========================================
            04 STAFF PERFORMANCE
        ========================================== */}

        <ChartCard
          number="04"
          title="Staff Performance"
          subtitle="Assigned vs completed complaints"
        >

          <View
            style={
              styles.legendRow
            }
          >

            <Legend
              color="#3B82F6"
              label="Assigned"
            />

            <Legend
              color="#22C55E"
              label="Completed"
            />

          </View>

          <View
            style={
              styles.staffChart
            }
          >

            {staffData.map(
              (staff) => {

                const assignedHeight =
                  Math.max(
                    10,
                    (staff.assigned /
                      maxStaff) *
                      120
                  );

                const completedHeight =
                  staff.completed > 0
                    ? Math.max(
                        10,
                        (staff.completed /
                          maxStaff) *
                          120
                      )
                    : 5;

                return (
                  <View
                    key={staff.name}
                    style={
                      styles.staffColumn
                    }
                  >

                    <Text
                      style={[
                        styles.valueText,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {staff.assigned}
                    </Text>

                    <View
                      style={
                        styles.staffBars
                      }
                    >

                      <View
                        style={[
                          styles.staffBar,
                          {
                            height:
                              assignedHeight,
                            backgroundColor:
                              "#3B82F6",
                          },
                        ]}
                      />

                      <View
                        style={[
                          styles.staffBar,
                          {
                            height:
                              completedHeight,
                            backgroundColor:
                              "#22C55E",
                          },
                        ]}
                      />

                    </View>

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.staffName,
                        {
                          color:
                            colors.muted,
                        },
                      ]}
                    >
                      {staff.name}
                    </Text>

                  </View>
                );
              }
            )}

          </View>

        </ChartCard>

        {/* ==========================================
            05 PENDING AGE
        ========================================== */}

        <ChartCard
          number="05"
          title="Pending Age Analysis"
          subtitle="Age of currently open complaints"
        >

          {pendingAgeData.map(
            ([label, value], index) => (
              <HorizontalBar
                key={label}
                label={label}
                value={value}
                max={maxPendingAge}
                color={
                  index === 3
                    ? "#EF4444"
                    : "#F59E0B"
                }
                colors={colors}
              />
            )
          )}

        </ChartCard>

        {/* ==========================================
            06 STATUS
        ========================================== */}

        <ChartCard
          number="06"
          title="Complaint Status Overview"
          subtitle="Current complaint distribution"
        >

          {statusData.map(
            (item) => {

              const width =
                (item.value /
                  maxStatus) *
                100;

              return (
                <View
                  key={item.label}
                  style={
                    styles.statusRow
                  }
                >

                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          item.color,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.statusLabel,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>

                  <View
                    style={[
                      styles.statusTrack,
                      {
                        backgroundColor:
                          colors.border,
                      },
                    ]}
                  >

                    <View
                      style={[
                        styles.statusFill,
                        {
                          width:
                            `${width}%`,
                          backgroundColor:
                            item.color,
                        },
                      ]}
                    />

                  </View>

                  <Text
                    style={[
                      styles.statusValue,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {item.value}
                  </Text>

                </View>
              );
            }
          )}

        </ChartCard>

        {/* ==========================================
            SMART INSIGHTS
        ========================================== */}

        <View
          style={
            styles.insightHeader
          }
        >

          <View
            style={
              styles.insightIcon
            }
          >
            <Ionicons
              name="bulb-outline"
              size={18}
              color="#F59E0B"
            />
          </View>

          <View>
            <Text
              style={[
                styles.insightTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Smart Insights
            </Text>

            <Text
              style={[
                styles.insightSubtitle,
                {
                  color:
                    colors.muted,
                },
              ]}
            >
              Based on {period}
            </Text>
          </View>

        </View>

      </ScrollView>

      {/* =================================================
          DATE BOTTOM POPUP
      ================================================= */}

      <Modal
        visible={periodOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() =>
          setPeriodOpen(false)
        }
      >

        {/* DIMMED BACKGROUND */}

        <TouchableOpacity
          activeOpacity={1}
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setPeriodOpen(false)
          }
        />

        {/* BOTTOM SHEET */}

        <View
          style={[
            styles.bottomSheet,
            {
              backgroundColor:
                colors.surface,
              paddingBottom:
                20 + insets.bottom,
            },
          ]}
        >

          {/* HANDLE */}

          <View
            style={
              styles.modalHandle
            }
          />

          {/* TITLE */}

          <View
            style={
              styles.modalHeader
            }
          >

            <View>

              <Text
                style={[
                  styles.modalTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Analytics Period
              </Text>

              <Text
                style={[
                  styles.modalSubtitle,
                  {
                    color:
                      colors.muted,
                  },
                ]}
              >
                Select reporting period
              </Text>

            </View>

            <TouchableOpacity
              onPress={() =>
                setPeriodOpen(false)
              }
            >

              <Ionicons
                name="close-circle-outline"
                size={26}
                color={
                  colors.muted
                }
              />

            </TouchableOpacity>

          </View>

          {/* OPTIONS */}

          {[
            "7 Days",
            "30 Days",
            "90 Days",
          ].map((item) => (

            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => {
                setPeriod(item);
                setPeriodOpen(false);
              }}
              style={[
                styles.periodOption,
                {
                  backgroundColor:
                    period === item
                      ? "#EFF6FF"
                      : colors.surface,

                  borderColor:
                    period === item
                      ? "#2563EB"
                      : colors.border,
                },
              ]}
            >

              <View
                style={[
                  styles.periodIcon,
                  {
                    backgroundColor:
                      period === item
                        ? "#2563EB"
                        : "#EFF6FF",
                  },
                ]}
              >

                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={
                    period === item
                      ? "#FFFFFF"
                      : "#2563EB"
                  }
                />

              </View>

              <View
                style={{
                  flex: 1,
                }}
              >

                <Text
                  style={[
                    styles.optionTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {item}
                </Text>

                <Text
                  style={[
                    styles.optionSubtitle,
                    {
                      color:
                        colors.muted,
                    },
                  ]}
                >
                  {item === "7 Days"
                    ? "Last 7 days"
                    : item === "30 Days"
                    ? "Last 30 days"
                    : "Last 90 days"}
                </Text>

              </View>

              {period === item && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color="#2563EB"
                />
              )}

            </TouchableOpacity>

          ))}

        </View>

      </Modal>

    </SafeAreaView>
  );
}

// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  icon,
  title,
  value,
  colors,
}) {
  return (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor:
            colors.surface,
          borderColor:
            colors.border,
        },
      ]}
    >

      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor:
              colors.input,
          },
        ]}
      >

        <Ionicons
          name={icon}
          size={19}
          color={
            colors.primary
          }
        />

      </View>

      <Text
        style={[
          styles.summaryValue,
          {
            color:
              colors.text,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.summaryTitle,
          {
            color:
              colors.muted,
          },
        ]}
      >
        {title}
      </Text>

    </View>
  );
}

// ======================================================
// CHART CARD
// ======================================================

function ChartCard({
  number,
  title,
  subtitle,
  children,
}) {
  return (
    <AppCard
      style={
        styles.chartCard
      }
    >

      <View
        style={
          styles.chartHeader
        }
      >

        <View
          style={
            styles.chartNumber
          }
        >

          <Text
            style={
              styles.chartNumberText
            }
          >
            {number}
          </Text>

        </View>

        <View
          style={{
            flex: 1,
          }}
        >

          <Text
            style={
              styles.chartTitle
            }
          >
            {title}
          </Text>

          <Text
            style={
              styles.chartSubtitle
            }
          >
            {subtitle}
          </Text>

        </View>

      </View>

      {children}

    </AppCard>
  );
}

// ======================================================
// HORIZONTAL BAR
// ======================================================

function HorizontalBar({
  label,
  value,
  max,
  color,
  colors,
}) {
  const width =
    value > 0
      ? Math.max(
          6,
          (value / max) * 100
        )
      : 0;

  return (
    <View
      style={
        styles.horizontalRow
      }
    >

      <Text
        numberOfLines={1}
        style={[
          styles.horizontalLabel,
          {
            color:
              colors.text,
          },
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.horizontalTrack,
          {
            backgroundColor:
              colors.border,
          },
        ]}
      >

        <View
          style={[
            styles.horizontalFill,
            {
              width:
                `${width}%`,
              backgroundColor:
                color,
            },
          ]}
        />

      </View>

      <Text
        style={[
          styles.horizontalValue,
          {
            color:
              colors.text,
          },
        ]}
      >
        {value}
      </Text>

    </View>
  );
}

// ======================================================
// LEGEND
// ======================================================

function Legend({
  color,
  label,
}) {
  return (
    <View
      style={
        styles.legend
      }
    >

      <View
        style={[
          styles.legendDot,
          {
            backgroundColor:
              color,
          },
        ]}
      />

      <Text
        style={
          styles.legendText
        }
      >
        {label}
      </Text>

    </View>
  );
}

// ======================================================
// EMPTY
// ======================================================

function EmptyState({
  colors,
  message,
}) {
  return (
    <View
      style={
        styles.emptyState
      }
    >

      <Ionicons
        name="bar-chart-outline"
        size={30}
        color={
          colors.muted
        }
      />

      <Text
        style={[
          styles.emptyText,
          {
            color:
              colors.muted,
          },
        ]}
      >
        {message}
      </Text>

    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({

    safeArea: {
      flex: 1,
    },

    // -----------------------------------------------
    // HEADER
    // -----------------------------------------------

    header: {
      height: 58,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
    },

    backButton: {
      width: 45,
      height: 45,
      alignItems: "center",
      justifyContent: "center",
    },

    headerTitle: {
      fontSize: 25,
      fontWeight: "900",
      marginLeft: 5,
    },

    // SAME LINE AS RAISE COMPLAINT
    headerDivider: {
      height: 1,
      width: "100%",
    },

    // -----------------------------------------------
    // OVERVIEW
    // -----------------------------------------------

    overviewRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      // GAP BELOW DIVIDER
      marginTop: 25,

      marginBottom: 18,
      paddingHorizontal: 17,
    },

    overviewLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 8,
    },

    analyticsImage: {
      width: 34,
      height: 34,
      marginRight: 8,
    },

    overviewTitle: {
      fontSize: 17,
      fontWeight: "900",
    },

    overviewSubtitle: {
      fontSize: 9,
      marginTop: 4,
    },

    // -----------------------------------------------
    // DATE BUTTON
    // -----------------------------------------------

    dateButton: {
      height: 32,
      minWidth: 82,
      borderRadius: 9,
      borderWidth: 1.5,
      paddingHorizontal: 7,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    dateText: {
      fontSize: 9,
      fontWeight: "900",
      marginHorizontal: 4,
    },

    // -----------------------------------------------
    // SUMMARY
    // -----------------------------------------------

    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: 17,
    },

    summaryCard: {
      width: "48%",
      minHeight: 105,
      borderRadius: 16,
      borderWidth: 1,
      padding: 12,
      marginBottom: 10,
    },

    summaryIcon: {
      width: 35,
      height: 35,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 7,
    },

    summaryValue: {
      fontSize: 22,
      fontWeight: "900",
    },

    summaryTitle: {
      fontSize: 9,
      fontWeight: "700",
      marginTop: 2,
    },

    // -----------------------------------------------
    // CHART CARD
    // -----------------------------------------------

    chartCard: {
      marginHorizontal: 17,
      marginBottom: 13,
      padding: 15,
    },

    chartHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },

    chartNumber: {
      width: 33,
      height: 33,
      borderRadius: 10,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 9,
    },

    chartNumberText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#2563EB",
    },

    chartTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: "#0F172A",
    },

    chartSubtitle: {
      fontSize: 9,
      color: "#64748B",
      marginTop: 3,
    },

    // -----------------------------------------------
    // TREND
    // -----------------------------------------------

    trendChart: {
      height: 170,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-around",
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
    },

    trendColumn: {
      width: "16%",
      height: 150,
      alignItems: "center",
      justifyContent: "flex-end",
    },

    trendBar: {
      width: 27,
      borderRadius: 7,
      marginTop: 4,
    },

    valueText: {
      fontSize: 9,
      fontWeight: "900",
    },

    axisText: {
      fontSize: 8,
      marginTop: 5,
    },

    // -----------------------------------------------
    // HORIZONTAL
    // -----------------------------------------------

    horizontalRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 13,
    },

    horizontalLabel: {
      width: 82,
      fontSize: 9,
      fontWeight: "800",
    },

    horizontalTrack: {
      flex: 1,
      height: 9,
      borderRadius: 6,
      overflow: "hidden",
    },

    horizontalFill: {
      height: "100%",
      borderRadius: 6,
    },

    horizontalValue: {
      width: 28,
      textAlign: "right",
      fontSize: 10,
      fontWeight: "900",
    },

    // -----------------------------------------------
    // DEPARTMENT
    // -----------------------------------------------

    departmentChart: {
      height: 175,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-around",
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
    },

    departmentColumn: {
      width: "17%",
      height: 155,
      alignItems: "center",
      justifyContent: "flex-end",
    },

    departmentBar: {
      width: 25,
      minHeight: 10,
      borderRadius: 7,
      marginTop: 3,
    },

    departmentLabel: {
      maxWidth: 60,
      textAlign: "center",
      fontSize: 8,
      marginTop: 5,
    },

    // -----------------------------------------------
    // STAFF
    // -----------------------------------------------

    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 18,
      marginBottom: 10,
    },

    legend: {
      flexDirection: "row",
      alignItems: "center",
    },

    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 5,
    },

    legendText: {
      fontSize: 9,
      fontWeight: "700",
    },

    staffChart: {
      height: 180,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-around",
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
    },

    staffColumn: {
      width: "18%",
      height: 160,
      alignItems: "center",
      justifyContent: "flex-end",
    },

    staffBars: {
      height: 125,
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 3,
    },

    staffBar: {
      width: 12,
      minHeight: 5,
      borderRadius: 5,
    },

    staffName: {
      width: 60,
      textAlign: "center",
      fontSize: 8,
      marginTop: 6,
    },

    // -----------------------------------------------
    // STATUS
    // -----------------------------------------------

    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },

    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
    },

    statusLabel: {
      width: 72,
      fontSize: 9,
      fontWeight: "800",
    },

    statusTrack: {
      flex: 1,
      height: 9,
      borderRadius: 6,
      overflow: "hidden",
    },

    statusFill: {
      height: "100%",
      borderRadius: 6,
    },

    statusValue: {
      width: 28,
      textAlign: "right",
      fontSize: 10,
      fontWeight: "900",
    },

    // -----------------------------------------------
    // INSIGHTS
    // -----------------------------------------------

    insightHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 17,
      marginTop: 4,
      marginBottom: 10,
    },

    insightIcon: {
      width: 35,
      height: 35,
      borderRadius: 10,
      backgroundColor: "#FEF3C7",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 9,
    },

    insightTitle: {
      fontSize: 17,
      fontWeight: "900",
    },

    insightSubtitle: {
      fontSize: 9,
      marginTop: 2,
    },

    // -----------------------------------------------
    // EMPTY
    // -----------------------------------------------

    emptyState: {
      minHeight: 80,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyText: {
      fontSize: 10,
      marginTop: 6,
    },

    // -----------------------------------------------
    // DATE POPUP
    // -----------------------------------------------

    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        "rgba(15,23,42,0.45)",
    },

    bottomSheet: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,

      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,

      paddingHorizontal: 17,
      paddingTop: 10,

      elevation: 20,

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },

    modalHandle: {
      width: 42,
      height: 4,
      borderRadius: 5,
      backgroundColor: "#CBD5E1",
      alignSelf: "center",
      marginBottom: 16,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },

    modalTitle: {
      fontSize: 19,
      fontWeight: "900",
    },

    modalSubtitle: {
      fontSize: 9,
      marginTop: 3,
    },

    periodOption: {
      minHeight: 62,
      borderWidth: 1,
      borderRadius: 15,

      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 11,
      marginTop: 9,
    },

    periodIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,

      alignItems: "center",
      justifyContent: "center",

      marginRight: 11,
    },

    optionTitle: {
      fontSize: 12,
      fontWeight: "900",
    },

    optionSubtitle: {
      fontSize: 9,
      marginTop: 3,
    },

  });