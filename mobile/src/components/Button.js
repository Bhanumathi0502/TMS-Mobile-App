import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { shadow } from "../theme";

export default function Button({
  title,
  onPress,
  disabled = false,
  variant = "primary",
}) {
  const { colors, dark } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor:
            variant === "primary"
              ? colors.primary
              : variant === "danger"
              ? dark
                ? "#451A1A"
                : "#FEE2E2"
              : dark
              ? colors.input
              : "#E2E8F0",
        },
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: variant === "primary" ? "#FFFFFF" : colors.text },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 6,
    ...shadow,
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    fontWeight: "800",
    fontSize: 15,
  },
});
