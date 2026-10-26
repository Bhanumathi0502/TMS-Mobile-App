import React, { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import Screen from "../components/Screen";
import Field from "../components/Field";
import Button from "../components/Button";
import { colors } from "../theme";

export default function BootstrapScreen({ navigation }) {
  const { bootstrapSuperAdmin } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.name || !form.phone || !form.email || !form.password) {
      return Alert.alert("Validation", "Fill all fields");
    }

    try {
      setBusy(true);
      await bootstrapSuperAdmin(form);
      Alert.alert("Success", "SuperAdmin created successfully");
    } catch (e) {
      Alert.alert(
        "Setup Failed",
        e.response?.data?.message || "SuperAdmin may already exist"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Create SuperAdmin</Text>
      <Text style={styles.subtitle}>
        One-time setup. After creating the account, use it to log in.
      </Text>

      <Field
        label="Name"
        value={form.name}
        onChangeText={(v) => setForm(p => ({ ...p, name: v }))}
        placeholder="Super Admin"
      />
      <Field
        label="Phone Number"
        value={form.phone}
        onChangeText={(v) => setForm(p => ({ ...p, phone: v }))}
        placeholder="9876543210"
        keyboardType="phone-pad"
      />
      <Field
        label="Email"
        value={form.email}
        onChangeText={(v) => setForm(p => ({ ...p, email: v }))}
        placeholder="admin@gmail.com"
        keyboardType="email-address"
      />
      <Field
        label="Password"
        value={form.password}
        onChangeText={(v) => setForm(p => ({ ...p, password: v }))}
        placeholder="Admin@123"
        secureTextEntry
      />

      <Button
        title={busy ? "Creating..." : "Create SuperAdmin"}
        onPress={submit}
        disabled={busy}
      />
      <Button
        title="Back to Login"
        onPress={() => navigation.goBack()}
        variant="secondary"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "900", color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 20, marginTop: 5, marginBottom: 20 }
});
