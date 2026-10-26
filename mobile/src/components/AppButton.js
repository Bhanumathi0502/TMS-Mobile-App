import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, shadow } from "../theme";

export default function AppButton({ title, onPress, disabled = false, variant = "primary", style, textStyle }) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        variant === "secondary" && styles.secondary,
        variant === "danger" && styles.danger,
        disabled && styles.disabled,
        style
      ]}
    >
      <Text style={[styles.text, variant !== "primary" && styles.darkText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 6,
    ...shadow
  },
  secondary: { backgroundColor: "#E2E8F0" },
  danger: { backgroundColor: "#FEE2E2" },
  disabled: { opacity: 0.55 },
  text: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  darkText: { color: colors.text }
});
