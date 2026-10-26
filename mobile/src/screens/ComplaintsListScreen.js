import React, { useCallback, useMemo, useState } from "react";

import {
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";

import API from "../api";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import Screen from "../components/Screen";
import StatusPill from "../components/StatusPill";
import SelectField from "../components/SelectField";
import AppCard from "../components/AppCard";


// =====================================================
// HELPERS
// =====================================================

const staffRole = (role) => {
  const r = String(role || "").toLowerCase();

  return (
    r.includes("staff") ||
    [
      "plumber",
      "electrician",
      "software developer",
    ].includes(r)
  );
};


const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();


// =====================================================
// COMPLAINT LIST SCREEN
// =====================================================

export default function ComplaintsListScreen({
  navigation,
  route,
}) {

  const { colors } = useTheme();

  const { user } = useAuth();


  // ===================================================
  // STATE
  // ===================================================

  const [list, setList] = useState([]);

  const [staff, setStaff] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [priority, setPriority] = useState("");

  const [type, setType] = useState("");


  // ===================================================
  // ROLE
  // ===================================================

  const admin =
    String(user?.role || "").toLowerCase() ===
    "superadmin";

  const isStaff = staffRole(user?.role);


  // ===================================================
  // DASHBOARD FILTER
  //
  // Dashboard sends:
  //
  // {
  //   filter: "unassigned"
  // }
  //
  // This means:
  // Show only complaints that have NOT
  // been assigned to any staff.
  // ===================================================

  const unassignedOnly =
    route?.params?.filter === "unassigned";


  // ===================================================
  // LOAD COMPLAINTS
  // ===================================================

  const load = useCallback(
    async () => {

      setRefreshing(true);

      try {

        // -----------------------------------------------
        // GET COMPLAINTS
        // -----------------------------------------------

        const complaintsResponse =
          await API.get("/complaints");

        const complaintsData =
          Array.isArray(complaintsResponse.data)
            ? complaintsResponse.data
            : [];

        setList(complaintsData);


        // -----------------------------------------------
        // GET STAFF
        // -----------------------------------------------

        if (admin) {

          const usersResponse =
            await API.get("/masters/user");

          const users =
            Array.isArray(usersResponse.data)
              ? usersResponse.data
              : [];


          setStaff(
            users.filter((item) =>
              staffRole(item.role)
            )
          );

        } else {

          setStaff([]);

        }

      } catch (error) {

        console.log(
          "COMPLAINT LIST ERROR:",
          error?.response?.data ||
            error?.message
        );


        Alert.alert(
          "Complaints",
          error?.response?.data?.message ||
            "Unable to load complaints"
        );

      } finally {

        setRefreshing(false);

      }

    },
    [admin]
  );


  // ===================================================
  // LOAD WHEN SCREEN OPENS
  // ===================================================

  useFocusEffect(
    useCallback(() => {

      load();

    }, [load])
  );


  // ===================================================
  // FILTER COMPLAINTS
  // ===================================================

  const filtered = useMemo(() => {

    return list.filter((complaint) => {


      // =================================================
      // IMPORTANT:
      //
      // Dashboard → View All
      //
      // Admin sees ONLY complaints that are NOT
      // assigned to any staff.
      // =================================================

      if (unassignedOnly && admin) {

        const assigned =
          complaint.assignee &&
          (
            complaint.assignee._id ||
            complaint.assignee
          );


        if (assigned) {

          return false;

        }

      }


      // =================================================
      // SEARCH
      // =================================================

      const q =
        search.trim().toLowerCase();


      const searchableText = [

        complaint._id,

        complaint.complaintType,

        complaint.remarks,

        complaint.raisedBy?.name,

        complaint.assignee?.name,

        complaint.department?.name,

        complaint.programme?.name,

      ]
        .join(" ")
        .toLowerCase();


      // =================================================
      // NORMAL FILTERS
      // =================================================

      const matchesSearch =
        !q ||
        searchableText.includes(q);


      const matchesStatus =
        !status ||
        normalize(complaint.status) ===
          normalize(status);


      const matchesPriority =
        !priority ||
        String(
          complaint.priority || ""
        ) === priority;


      const matchesType =
        !type ||
        complaint.complaintType === type;


      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesType
      );

    });

  }, [
    list,
    search,
    status,
    priority,
    type,
    unassignedOnly,
    admin,
  ]);


  // ===================================================
  // ASSIGN COMPLAINT
  // ===================================================

  const assign = async (
    complaintId,
    assigneeId
  ) => {

    if (!assigneeId) {
      return;
    }


    try {

      await API.put(
        `/complaints/${complaintId}/assign`,
        {
          assigneeId,
        }
      );


      Alert.alert(
        "Success",
        "Complaint assigned successfully"
      );


      // Reload list
      await load();

    } catch (error) {

      console.log(
        "ASSIGN ERROR:",
        error?.response?.data ||
          error?.message
      );


      Alert.alert(
        "Assignment Failed",
        error?.response?.data?.message ||
          "Unable to assign complaint"
      );

    }

  };


  // ===================================================
  // UPDATE STATUS
  // ===================================================

  const updateStatus = async (
    complaintId,
    value
  ) => {

    if (!value) {
      return;
    }


    try {

      await API.put(
        `/complaints/${complaintId}/status`,
        {
          status: value,
        }
      );


      Alert.alert(
        "Success",
        `Status changed to ${value}`
      );


      await load();

    } catch (error) {

      console.log(
        "STATUS UPDATE ERROR:",
        error?.response?.data ||
          error?.message
      );


      Alert.alert(
        "Update Failed",
        error?.response?.data?.message ||
          "Unable to update status"
      );

    }

  };


  // ===================================================
  // RESET NORMAL FILTERS
  // ===================================================

  const resetFilters = () => {

    setSearch("");

    setStatus("");

    setPriority("");

    setType("");

  };


  // ===================================================
  // SCREEN
  // ===================================================

  return (

    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={load}
          tintColor={colors.primary}
        />
      }
    >

      {/* =================================================
          TITLE
      ================================================= */}

      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        Complaints
      </Text>


      {/* =================================================
          SUBTITLE
      ================================================= */}

      <Text
        style={[
          styles.subtitle,
          {
            color: colors.muted,
          },
        ]}
      >

        {admin
          ? unassignedOnly
            ? "Unassigned complaints • ready for assignment"
            : "All complaints • search and manage"
          : "Your complaint history and updates"}

      </Text>


      {/* =================================================
          SEARCH
      ================================================= */}

      <View
        style={[
          styles.searchBox,
          {
            backgroundColor:
              colors.surface,

            borderColor:
              colors.border,
          },
        ]}
      >

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search ID, type, person or remarks"
          placeholderTextColor={colors.muted}
          style={[
            styles.search,
            {
              color: colors.text,
            },
          ]}
        />


        {search.length > 0 && (

          <TouchableOpacity
            onPress={() =>
              setSearch("")
            }
          >

            <Text
              style={{
                color: colors.muted,
                fontWeight: "700",
              }}
            >
              Clear
            </Text>

          </TouchableOpacity>

        )}

      </View>


      {/* =================================================
          STATUS + PRIORITY
      ================================================= */}

      <View style={styles.filters}>

        <View style={{ flex: 1 }}>

          <SelectField
            label="Status"
            value={status}
            onChange={setStatus}
            placeholder="All"
            options={[
              "Pending",
              "Assigned",
              "In-Progress",
              "Onhold",
              "Completed",
            ].map((value) => ({
              value,
              label: value,
            }))}
          />

        </View>


        <View style={{ flex: 1 }}>

          <SelectField
            label="Priority"
            value={priority}
            onChange={setPriority}
            placeholder="All"
            options={[
              "Critical",
              "High",
              "Medium",
              "Low",
            ].map((value) => ({
              value,
              label: value,
            }))}
          />

        </View>

      </View>


      {/* =================================================
          COMPLAINT TYPE
      ================================================= */}

      <SelectField
        label="Complaint Type"
        value={type}
        onChange={setType}
        placeholder="All complaint types"
        options={[
          "PC Hardware",
          "PC Software",
          "Application Issues",
          "Network",
          "Electronics",
          "Plumbing",
        ].map((value) => ({
          value,
          label: value,
        }))}
      />


      {/* =================================================
          RESET FILTERS
      ================================================= */}

      {(search ||
        status ||
        priority ||
        type) ? (

        <TouchableOpacity
          onPress={resetFilters}
        >

          <Text
            style={[
              styles.reset,
              {
                color: colors.primary,
              },
            ]}
          >
            Reset filters
          </Text>

        </TouchableOpacity>

      ) : null}


      {/* =================================================
          COUNT
      ================================================= */}

      <Text
        style={[
          styles.count,
          {
            color: colors.muted,
          },
        ]}
      >

        {filtered.length} complaint
        {filtered.length === 1 ? "" : "s"}

      </Text>


      {/* =================================================
          COMPLAINT LIST
      ================================================= */}

      {filtered.map((complaint) => {

        const completed = [
          "completed",
          "closed",
        ].includes(
          normalize(complaint.status)
        );


        const mine =
          String(
            complaint.assignee?._id ||
              complaint.assignee
          ) ===
          String(user?._id);


        return (

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
              style={styles.card}
            >

              {/* =========================================
                  COMPLAINT HEADER
              ========================================= */}

           <View style={styles.row}>

  <View style={{ flex: 1 }}>

    <Text
      style={[
        styles.type,
        {
          color: colors.text,
        },
      ]}
    >
      {complaint.complaintType || "Complaint"}
    </Text>

    <Text
      style={[
        styles.id,
        {
          color: colors.muted,
        },
      ]}
    >
      #{String(complaint._id)
        .slice(-8)
        .toUpperCase()}
    </Text>

  </View>


  <StatusPill status={complaint.status} />


  {/* DETAILS ARROW */}

  <Ionicons
    name="chevron-forward"
    size={20}
    color={colors.muted}
    style={styles.detailsArrow}
  />

</View>


              {/* =========================================
                  REMARKS
              ========================================= */}

              <Text
                style={[
                  styles.remark,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                {complaint.remarks ||
                  "No remarks"}
              </Text>


              {/* =========================================
                  DEPARTMENT / PROGRAMME
              ========================================= */}

              <Text
                style={[
                  styles.info,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                {complaint.department?.name ||
                  "-"}{" "}
                •{" "}
                {complaint.programme?.name ||
                  "-"}
              </Text>


              {/* =========================================
                  BLOCK / ROOM
              ========================================= */}

              <Text
                style={[
                  styles.info,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                {complaint.block?.name ||
                  "-"}{" "}
                / Room{" "}
                {complaint.room?.roomNumber ||
                  "-"}
              </Text>


              {/* =========================================
                  PRIORITY / ASSIGNEE
              ========================================= */}

              <Text
                style={[
                  styles.info,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                Priority:{" "}
                {complaint.priority ||
                  "Medium"}{" "}
                • Assignee:{" "}
                {complaint.assignee?.name ||
                  "Not assigned"}
              </Text>



              {/* =========================================
                  STAFF STATUS UPDATE
              ========================================= */}

              {isStaff &&
              mine &&
              !completed ? (

                <View
                  style={styles.control}
                >

                  <SelectField
                    label="Update Status"
                    value=""
                    onChange={(value) =>
                      updateStatus(
                        complaint._id,
                        value
                      )
                    }
                    options={[
                      {
                        value: "In-Progress",
                        label: "In-Progress",
                      },
                      {
                        value: "Onhold",
                        label: "On Hold",
                      },
                      {
                        value: "Completed",
                        label: "Completed",
                      },
                    ]}
                    placeholder="Choose status"
                  />

                </View>

              ) : null}

            </AppCard>

          </TouchableOpacity>

        );

      })}


      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {!filtered.length ? (

        <AppCard>

          <View style={styles.empty}>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                },
              ]}
            >

              {unassignedOnly
                ? "No unassigned complaints"
                : "No matching complaints"}

            </Text>


            <Text
              style={[
                styles.info,
                {
                  color: colors.muted,
                },
              ]}
            >

              {unassignedOnly
                ? "All complaints have already been assigned."
                : "Try a different search or filter."}

            </Text>

          </View>

        </AppCard>

      ) : null}

    </Screen>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  title: {
    fontSize: 27,
    fontWeight: "900",
  },


  subtitle: {
    marginTop: 5,
    marginBottom: 14,
    lineHeight: 18,
  },


  searchBox: {
    height: 48,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },


  search: {
    flex: 1,
    fontSize: 13,
  },


  filters: {
    flexDirection: "row",
    gap: 10,
  },


  reset: {
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
  },


  count: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 9,
  },


  card: {
    marginBottom: 10,
    padding: 14,
  },


  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },


  type: {
    fontSize: 16,
    fontWeight: "900",
  },


  id: {
    fontSize: 9,
    fontWeight: "700",
    marginTop: 3,
  },


  remark: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },


  info: {
    fontSize: 10,
    marginTop: 5,
  },


  control: {
    marginTop: 7,
  },


  empty: {
    padding: 25,
    alignItems: "center",
  },


  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  detailsArrow: {
  marginLeft: 8,
},

});
