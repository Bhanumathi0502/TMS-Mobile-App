import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { colors, shadow } from "../theme";
import { useTheme } from "../context/ThemeContext";

export default function StatusFilter({
  value,
  onChange,
  counts = {},
  showClear = false,
  onClear
}) {
  const { colors:themeColors } = useTheme();
  const [open, setOpen] = useState(false);

  const options = [
    {
      value: "All",
      label: `Recent Complaints${counts.total ? ` (${counts.total})` : ""}`
    },
    {
      value: "Pending",
      label: `Pending${counts.pending ? ` (${counts.pending})` : ""}`
    },
    {
      value: "Assigned",
      label: `Assigned${counts.assigned ? ` (${counts.assigned})` : ""}`
    },
    {
      value: "Closed",
      label: `Closed${counts.closed ? ` (${counts.closed})` : ""}`
    }
  ];

  const selected =
    options.find((item) => item.value === value) ||
    options[0];

  return (
    <View style={[styles.wrap,{backgroundColor:themeColors.surface,borderColor:themeColors.border}]}>

      {/* FILTER HEADER */}
      <View style={styles.labelRow}>

        <Text style={[styles.label,{color:themeColors.text}]}>
          Filter by Status
        </Text>

        {showClear && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.clearButton}
            onPress={onClear}
          >
            <Text style={styles.clearButtonText}>
              Clear Filter
            </Text>
          </TouchableOpacity>
        )}

      </View>

      {/* SELECTOR */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.selector,{backgroundColor:themeColors.surface,borderColor:themeColors.border},
          open && styles.selectorOpen
        ]}
        onPress={() => setOpen((value) => !value)}
      >

        <View>
          <Text style={[styles.selected,{color:themeColors.text}]}>
            {selected.label}
          </Text>

          <Text style={styles.hint}>
            Show matching complaints
          </Text>
        </View>

        <Text style={styles.chevron}>
          {open ? "⌃" : "⌄"}
        </Text>

      </TouchableOpacity>

      {/* DROPDOWN */}
      {open && (
        <View style={[styles.menu,{backgroundColor:themeColors.surface,borderColor:themeColors.border}]}>

          {options.map((option) => {

            const active =
              option.value === value;

            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.8}
                style={[
                  styles.option,
                  active && styles.optionActive
                ]}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >

                <Text
                  style={[
                    styles.optionText,{color:themeColors.text},
                    active &&
                      styles.optionTextActive
                  ]}
                >
                  {option.label}
                </Text>

                {active && (
                  <Text style={styles.check}>
                    ✓
                  </Text>
                )}

              </TouchableOpacity>
            );

          })}

        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  wrap: {
  marginTop: 6,
  marginBottom: 14,

  paddingHorizontal: 18,
  paddingVertical: 18,

  backgroundColor: "#FFFFFF",

  borderRadius: 18,

  borderWidth: 1,
  borderColor: "#E2E8F0",

  ...shadow,

  zIndex: 20
},
  /* FILTER BY STATUS + CLEAR FILTER */
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },

  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },

  clearButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 10,
  backgroundColor: "#EFF6FF",
  borderWidth: 1,
  borderColor: "#BFDBFE",
},

clearButtonText: {
  color: colors.primary,
  fontSize: 12,
  fontWeight: "800",
},
  /* SELECTOR */
  selector: {
    backgroundColor: colors.surface,
    minHeight: 58,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  selectorOpen: {
    borderColor: colors.primary
  },

  selected: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 14
  },

  hint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2
  },

  chevron: {
    color: colors.muted,
    fontSize: 21,
    fontWeight: "800"
  },

  /* DROPDOWN */
  menu: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginTop: 6,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow
  },

  option: {
    minHeight: 46,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  optionActive: {
    backgroundColor: "#EFF6FF"
  },

  optionText: {
    color: colors.text,
    fontWeight: "700"
  },

  optionTextActive: {
    color: colors.primary
  },

  check: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 16
  }

});