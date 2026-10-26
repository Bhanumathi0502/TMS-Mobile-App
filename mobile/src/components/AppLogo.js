import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function AppLogo({ size = 92, textStyle, containerStyle }) {
  return (
    <View style={[styles.logoWrap, containerStyle]}>
      <Image
        source={require("../../assets/TMS.png")}
        style={{ width: size * 1.5, height: size }}
        resizeMode="contain"
      />
      {textStyle ? (
        <Text style={[styles.subtitle, textStyle]}>
          TICKET MANAGEMENT SYSTEM
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  logoWrap: { alignItems: "center" },
  subtitle: {
    marginTop: 10,
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    textAlign: "center"
  }
});
