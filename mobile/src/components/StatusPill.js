import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

function normalizeStatus(status) {
  const v = String(status || "").trim().toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");
  if (["pending", "p"].includes(v)) return "pending";
  if (["assigned", "assign", "assigned to"].includes(v)) return "assigned";
  if (["in progress", "inprogress", "working"].includes(v)) return "in-progress";
  if (["on hold", "onhold", "hold"].includes(v)) return "on-hold";
  if (["completed", "complete", "closed", "close", "done"].includes(v)) return "completed";
  return v || "unknown";
}

export default function StatusPill({ status }) {
  const { dark } = useTheme();
  const n = normalizeStatus(status);
  const map = {
    pending: ["PENDING", dark ? "#431407" : "#FFF7ED", "#F97316"],
    assigned: ["ASSIGNED", dark ? "#422006" : "#FEFCE8", "#EAB308"],
    "in-progress": ["IN PROGRESS", dark ? "#172554" : "#EFF6FF", "#3B82F6"],
    "on-hold": ["ON HOLD", dark ? "#450A0A" : "#FEF2F2", "#EF4444"],
    completed: ["CLOSED", dark ? "#052E16" : "#F0FDF4", "#22C55E"],
  };
  const [label, bg, color] = map[n] || ["UNKNOWN", dark ? "#1E293B" : "#F1F5F9", dark ? "#CBD5E1" : "#475569"];
  return <View style={[styles.container, { backgroundColor: bg }]}><View style={[styles.dot, { backgroundColor: color }]} /><Text style={[styles.text, { color }]}>{label}</Text></View>;
}
const styles=StyleSheet.create({container:{flexDirection:"row",alignItems:"center",alignSelf:"flex-start",paddingHorizontal:9,paddingVertical:5,borderRadius:20},dot:{width:6,height:6,borderRadius:3,marginRight:5},text:{fontSize:9,fontWeight:"900",letterSpacing:.5}});
