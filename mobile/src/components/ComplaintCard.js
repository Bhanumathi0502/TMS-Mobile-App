import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import StatusPill from "./StatusPill";
import { colors, shadow } from "../theme";
import { useTheme } from "../context/ThemeContext";
import { getLifecycleDates } from "../utils/complaintDates";

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function shortId(id) {
  const value = String(id || "");
  return value ? `#${value.slice(-8).toUpperCase()}` : "#UNKNOWN";
}

export default function ComplaintCard({ complaint, onPress, index = 0, canAssign = false, onAssign }) {
  const {colors:themeColors}=useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(8)).current;
  const lifecycle = getLifecycleDates(complaint);

  useEffect(() => {
    const delay = Math.min(index * 45, 250);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 260, delay, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 300, delay, useNativeDriver: true })
    ]).start();
  }, [index, opacity, translate]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: translate }] }}>
      <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={[styles.card,{backgroundColor:themeColors.surface,borderColor:themeColors.border}]}>
        <View style={styles.header}>
          <View style={styles.idRow}>
            <View style={styles.ticketIcon}><Text style={styles.ticketIconText}>#</Text></View>
            <View>
              <Text style={[styles.id,{color:themeColors.text}]}>{shortId(complaint._id)}</Text>
              <Text style={[styles.date,{color:themeColors.muted}]}>{formatDate(complaint.createdAt)}</Text>
            </View>
          </View>
          <StatusPill status={complaint.status} />
        </View>

        <View style={styles.typeRow}><Text style={[styles.type,{color:themeColors.text}]}>{complaint.complaintType || "Complaint"}</Text><Text style={styles.priority}>{complaint.priority || "Medium"}</Text></View>
        <Text numberOfLines={2} style={[styles.description,{color:themeColors.muted}]}>{complaint.remarks || "No description provided."}</Text>

        <View style={styles.metaRow}>
          <Meta icon="⌂" value={`Room ${complaint.room?.roomNumber || "-"}`} />
          <Meta icon="◉" value={complaint.department?.name || "-"} />
        </View>

        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={[styles.assignee,{color:themeColors.muted}]}>
              {complaint.assignee?.name ? `Assigned to ${complaint.assignee.name}` : "Not assigned"}
            </Text>
            <Text style={[styles.lifecycleText,{color:themeColors.muted}]}>Raised {lifecycle.raised} • Assigned {lifecycle.assigned} • Closed {lifecycle.closed}</Text>
          </View>
          <View style={styles.footerActions}>
            {canAssign && complaint.status !== "Completed" ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.assignButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onAssign?.(complaint);
                }}
              >
                <Text style={styles.assignButtonText}>Assign</Text>
              </TouchableOpacity>
            ) : null}
            <Text style={styles.arrow}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function Meta({ icon, value }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaIcon}>{icon}</Text>
      <Text numberOfLines={1} style={styles.metaText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 17, padding: 15, marginBottom: 11, borderWidth: 1, borderColor: colors.border, ...shadow },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  idRow: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
  ticketIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center", marginRight: 9 },
  ticketIconText: { color: colors.primary, fontWeight: "900" },
  id: { color: colors.text, fontWeight: "900", fontSize: 13 },
  date: { color: colors.muted, fontSize: 10, marginTop: 2 },
  type: { color: colors.text, fontSize: 16, fontWeight: "900", flex:1 }, typeRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}, priority:{fontSize:9,fontWeight:"900",color:"#315D8A",backgroundColor:"#EFF6FF",paddingHorizontal:7,paddingVertical:4,borderRadius:8},
  description: { color: "#475569", fontSize: 12, lineHeight: 18, marginTop: 6 },
  metaRow: { flexDirection: "row", marginTop: 12 },
  meta: { flexDirection: "row", alignItems: "center", maxWidth: "50%", marginRight: 15 },
  metaIcon: { color: colors.primary, fontWeight: "900", marginRight: 5 },
  metaText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12, paddingTop: 10, flexDirection: "row", alignItems: "center" },
  assignee: { flex: 1, color: colors.muted, fontSize: 11, fontWeight: "700" },
  lifecycleText: { color: colors.muted, fontSize: 10, marginTop: 3 },
  footerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  assignButton: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "#E0F2FE" },
  assignButtonText: { color: colors.primaryDark, fontWeight: "800", fontSize: 10 },
  arrow: { color: colors.primary, fontSize: 23, lineHeight: 20, fontWeight: "500" }
});
