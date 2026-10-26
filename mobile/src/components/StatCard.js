import React from "react";
import { useTheme } from "../context/ThemeContext";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function StatCard({
  type,
  label,
  value,
  index,
  onPress
}) {
  const {colors,dark}=useTheme();
  let icon = "▣";
  let iconColor = "#2563EB";
  let iconBackground = dark ? "#172554" : "#EFF6FF";
  let topColor = "#2563EB";

  // TOTAL
  if (type === "total") {
    icon = "▣";
    iconColor = "#2563EB";
    iconBackground = dark ? "#172554" : "#EFF6FF";
    topColor = "#2563EB";
  }

  // PENDING
  else if (type === "pending") {
    icon = "◷";
    iconColor = "#f5590b";
    iconBackground = dark ? "#431407" : "#FFF7ED";
    topColor = "#f5590b";
  }

  // ASSIGNED
  else if (type === "assigned") {
    icon = "↗";
    iconColor = "#CA8A04";
    iconBackground = dark ? "#422006" : "#FEFCE8";
    topColor = "#FACC15";
  }

  // CLOSED
  else if (type === "closed") {
    icon = "✓";
    iconColor = "#16A34A";
    iconBackground = dark ? "#052E16" : "#F0FDF4";
    topColor = "#16A34A";
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,{backgroundColor:colors.surface,borderColor:colors.border},
        {
          borderTopColor: topColor
        }
      ]}
    >
      {/* TOP ROW */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor:
                iconBackground
            }
          ]}
        >
          <Text
            style={[
              styles.icon,
              {
                color: iconColor
              }
            ]}
          >
            {icon}
          </Text>
        </View>

        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                topColor
            }
          ]}
        />
      </View>

      {/* VALUE */}

      <Text style={[styles.value,{color:colors.text}]}>
        {value ?? 0}
      </Text>

      {/* LABEL */}

      <Text style={[styles.label,{color:colors.muted}]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",

    minHeight: 138,

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#E2E8F0",

    borderTopWidth: 3,

    paddingHorizontal: 16,
    paddingVertical: 14,

    marginBottom: 12,

    elevation: 4,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  topRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  iconBox: {
    width: 44,
    height: 44,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 21,

    fontWeight: "900",
  },

  statusDot: {
    width: 8,
    height: 8,

    borderRadius: 4,
  },

  value: {
    marginTop: 12,

    fontSize: 32,

    lineHeight: 38,

    fontWeight: "900",

    color: "#0F172A",
  },

  label: {
    marginTop: 3,

    fontSize: 13,

    lineHeight: 18,

    fontWeight: "700",

    color: "#64748B",

    flexShrink: 1,
  },
});