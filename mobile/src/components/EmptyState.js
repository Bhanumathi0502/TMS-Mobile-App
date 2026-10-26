import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export default function EmptyState({ title, message, icon = "✓" }) {
  return (
    <View style={styles.box}>
      <View style={styles.icon}><Text style={styles.iconText}>{icon}</Text></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surface, borderRadius: 17, padding: 28, alignItems: "center", marginTop: 4, borderWidth: 1, borderColor: colors.border },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  iconText: { color: colors.success, fontSize: 22, fontWeight: "900" },
  title: { color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "center" },
  message: { color: colors.muted, fontSize: 12, textAlign: "center", lineHeight: 18, marginTop: 5 }
});
