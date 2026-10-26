import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme";

export default function AppInput({ label, inputStyle, style, ...props }) {
  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        placeholderTextColor="#94A3B8"
        style={[styles.input, props.multiline && styles.multiline, inputStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { color: colors.text, fontSize: 13, fontWeight: "800", marginBottom: 7 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15
  },
  multiline: { minHeight: 112, textAlignVertical: "top" }
});
