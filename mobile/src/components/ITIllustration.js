import React from "react";
import { StyleSheet, View } from "react-native";

export default function ITIllustration() {
  return (
    <View style={styles.wrap}>
      <View style={styles.screen}>
        <View style={styles.screenTop} />
        <View style={styles.screenBody} />
      </View>
      <View style={styles.base} />
      <View style={styles.server}>
        <View style={styles.serverBar} />
        <View style={styles.serverBar} />
        <View style={styles.serverBar} />
      </View>
      <View style={styles.node} />
      <View style={styles.nodeSmall} />
      <View style={styles.lineOne} />
      <View style={styles.lineTwo} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 260,
    height: 180,
    justifyContent: "center",
    alignItems: "center"
  },
  screen: {
    width: 110,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#0F172A",
    padding: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  screenTop: {
    width: 58,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#60A5FA",
    marginBottom: 8
  },
  screenBody: {
    width: 72,
    height: 24,
    borderRadius: 10,
    backgroundColor: "#E2E8F0"
  },
  base: {
    width: 86,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
    marginTop: 8
  },
  server: {
    position: "absolute",
    left: 34,
    bottom: 16,
    width: 64,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    borderWidth: 2,
    borderColor: "#38BDF8",
    paddingTop: 10,
    alignItems: "center"
  },
  serverBar: {
    width: 36,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
    marginBottom: 6
  },
  node: {
    position: "absolute",
    right: 36,
    top: 34,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#38BDF8"
  },
  nodeSmall: {
    position: "absolute",
    right: 24,
    bottom: 34,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0F172A"
  },
  lineOne: {
    position: "absolute",
    left: 56,
    top: 60,
    width: 70,
    height: 2,
    backgroundColor: "#94A3B8"
  },
  lineTwo: {
    position: "absolute",
    right: 52,
    bottom: 50,
    width: 70,
    height: 2,
    backgroundColor: "#94A3B8"
  }
});
