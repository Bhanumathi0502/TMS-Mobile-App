import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Screen from "../components/Screen";
import AppCard from "../components/AppCard";
import { colors } from "../theme";

const masters = [
  ["department", "Department", "Department + Department Short Name"],
  ["programme", "Programme", "Department + Programme + Programme Short Name"],
  ["block", "Block", "Department + Programme + Block Name"],
  ["room", "Room Number", "Department + Programme + Block + Room Number"],
  ["role", "Role", "Role Name"],
  ["user", "User", "User Name + Phone + Email + Role + Department + Programme"]
];

export default function MastersScreen({ navigation }) {
  return (
    <Screen>
      <Text style={styles.title}>Master Screens</Text>
      <Text style={styles.subtitle}>SuperAdmin access only</Text>

      {masters.map(([type, title, description]) => (
        <TouchableOpacity
          key={type}
          activeOpacity={0.88}
          onPress={() => navigation.navigate("Master Form", { type, title })}
        >
          <AppCard style={styles.card}>
            <Text style={styles.name}>{title}</Text>
            <Text style={styles.desc}>{description}</Text>
            <Text style={styles.arrow}>›</Text>
          </AppCard>
        </TouchableOpacity>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "900", color: colors.text },
  subtitle: { color: colors.muted, marginBottom: 18, marginTop: 4 },
  card: { padding: 17, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "900", color: colors.text },
  desc: { color: colors.muted, marginTop: 5, paddingRight: 20, lineHeight: 19 },
  arrow: { position: "absolute", right: 17, top: 18, fontSize: 30, color: colors.primary }
});
