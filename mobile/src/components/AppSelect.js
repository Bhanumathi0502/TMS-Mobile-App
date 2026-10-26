import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { colors, shadow } from "../theme";
import { useTheme } from "../context/ThemeContext";

export default function AppSelect({ label, value, options = [], onChange, placeholder = "Select", disabled = false }) {
  const {colors:themeColors}=useTheme();
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  const selected = useMemo(() => {
    return options.find((item) => String(item.value) === String(value));
  }, [options, value]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((item) => String(item.label).toLowerCase().includes(term));
  }, [options, query]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: visible ? 1 : 0, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: visible ? 0 : 16, duration: 220, useNativeDriver: true })
    ]).start();
  }, [opacity, translateY, visible]);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label,{color:themeColors.text}]}>{label}</Text>
      <TouchableOpacity activeOpacity={0.9} disabled={disabled} onPress={() => setVisible(true)} style={[styles.trigger,{backgroundColor:themeColors.surface,borderColor:themeColors.border}, disabled && styles.disabled]}>
        <Text style={[styles.triggerText,{color:themeColors.text}, !selected && styles.placeholder]}>
          {selected?.label || placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="none" onRequestClose={() => setVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, { opacity, transform: [{ translateY }] }]}>
          <View style={styles.sheetHandle} />
          <Text style={[styles.sheetTitle,{color:themeColors.text}]}>{label}</Text>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${label.toLowerCase()}`}
            placeholderTextColor="#94A3B8"
            style={[styles.searchInput,{backgroundColor:themeColors.input,borderColor:themeColors.border,color:themeColors.text}]}
            autoCapitalize="none"
          />

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {filtered.length ? (
              filtered.map((item) => {
                const active = String(item.value) === String(value);
                return (
                  <TouchableOpacity
                    key={String(item.value)}
                    onPress={() => {
                      onChange(item.value);
                      setVisible(false);
                      setQuery("");
                    }}
                    style={[styles.option, active && styles.optionActive]}
                  >
                    <Text style={[styles.optionText,{color:themeColors.text}, active && styles.optionTextActive]}>{item.label}</Text>
                    {active ? <Text style={styles.check}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No matching options</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { color: colors.text, fontSize: 13, fontWeight: "800", marginBottom: 7 },
  trigger: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  triggerText: { color: colors.text, fontSize: 15, fontWeight: "700", flex: 1 },
  disabled: { opacity: 0.65 },
  placeholder: { color: "#94A3B8" },
  chevron: { color: colors.muted, fontSize: 16, marginLeft: 8 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)"
  },
  sheet: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    maxHeight: "72%",
    ...shadow
  },
  sheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 10
  },
  sheetTitle: { color: colors.text, fontSize: 16, fontWeight: "900", marginBottom: 10 },
  searchInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    color: colors.text
  },
  list: { maxHeight: 320 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 4
  },
  optionActive: { backgroundColor: "#EFF6FF" },
  optionText: { color: colors.text, fontSize: 14, fontWeight: "700", flex: 1 },
  optionTextActive: { color: colors.primary },
  check: { color: colors.primary, fontWeight: "900", marginLeft: 8 },
  emptyState: { paddingVertical: 18, alignItems: "center" },
  emptyText: { color: colors.muted, fontSize: 13 }
});
