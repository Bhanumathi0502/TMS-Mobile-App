import React, { useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import Screen from "../components/Screen";
import Field from "../components/Field";
import SelectField from "../components/SelectField";
import Button from "../components/Button";
import AppCard from "../components/AppCard";
import { colors } from "../theme";

const TYPES = [
  "PC Hardware",
  "PC Software",
  "Application Issues",
  "Network",
  "Electronics",
  "Plumbing"
];

export default function RaiseComplaintScreen({ navigation }) {
  const { user } = useAuth();
  const isAdmin = String(user?.role || "").toLowerCase() === "superadmin";

  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    department: user?.department?._id || user?.department || "",
    programme: user?.programme?._id || user?.programme || "",
    block: "",
    room: "",
    complaintType: TYPES[0],
    priority: "Medium",
    remarks: ""
  });
  const [attachment, setAttachment] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [d, p, b, r] = await Promise.all([
          API.get("/masters/department"),
          API.get("/masters/programme"),
          API.get("/masters/block"),
          API.get("/masters/room")
        ]);
        setDepartments(d.data || []);
        setProgrammes(p.data || []);
        setBlocks(b.data || []);
        setRooms(r.data || []);
      } catch (e) {
        Alert.alert("Error", e.response?.data?.message || "Unable to load master data");
      }
    })();
  }, []);

  const progs = useMemo(() => {
    if (!form.department) return [];
    return programmes.filter((p) => String(p.department) === String(form.department));
  }, [programmes, form.department]);

  const filteredBlocks = useMemo(() => {
    if (!form.department || !form.programme) return [];
    return blocks.filter(
      (b) =>
        String(b.department) === String(form.department) &&
        String(b.programme) === String(form.programme)
    );
  }, [blocks, form.department, form.programme]);

  const filteredRooms = useMemo(() => {
    if (!form.department || !form.programme || !form.block) return [];
    return rooms.filter(
      (r) =>
        String(r.department) === String(form.department) &&
        String(r.programme) === String(form.programme) &&
        String(r.block) === String(form.block)
    );
  }, [rooms, form.department, form.programme, form.block]);

  const pickAttachment = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true
    });
    if (!result.canceled) setAttachment(result.assets[0]);
  };

  const submit = async () => {
    if (!form.department || !form.programme || !form.block || !form.room || !form.remarks.trim()) {
      return Alert.alert("Validation", "Please fill Department, Programme, Block, Room and Remarks");
    }

    try {
      setBusy(true);
      const fd = new FormData();

      // For User, backend ignores department/programme from the request and uses JWT user details.
      // For SuperAdmin, these values allow selecting the complaint department/programme.
      fd.append("department", form.department);
      fd.append("programme", form.programme);
      fd.append("block", form.block);
      fd.append("room", form.room);
      fd.append("complaintType", form.complaintType);
      fd.append("priority", form.priority);
      fd.append("remarks", form.remarks.trim());

      if (attachment) {
        fd.append("attachment", {
          uri: attachment.uri,
          name: attachment.name || "attachment",
          type: attachment.mimeType || "application/octet-stream"
        });
      }

      await API.post("/complaints", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      Alert.alert("Success", "Complaint raised successfully");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Failed", e.response?.data?.message || "Unable to raise complaint");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Text style={styles.title}>Raise Complaint</Text>
        <Text style={styles.subtitle}>
          User Details: {user?.name} • {user?.email} • {user?.role}
        </Text>

        <AppCard style={styles.card}>
          <SelectField
            label="Department"
            value={form.department}
            disabled={!isAdmin}
            onChange={(v) => setForm((p) => ({ ...p, department: v, programme: "", block: "", room: "" }))}
            options={departments.map((d) => ({ value: d._id, label: d.name }))}
          />

          <SelectField
            label="Programme"
            value={form.programme}
            disabled={!isAdmin}
            onChange={(v) => setForm((p) => ({ ...p, programme: v, block: "", room: "" }))}
            options={progs.map((p) => ({ value: p._id, label: p.name }))}
          />

          <SelectField
            label="Block Name"
            value={form.block}
            onChange={(v) => setForm((p) => ({ ...p, block: v, room: "" }))}
            options={filteredBlocks.map((b) => ({ value: b._id, label: b.name }))}
          />

          <SelectField
            label="Room Number"
            value={form.room}
            onChange={(v) => setForm((p) => ({ ...p, room: v }))}
            options={filteredRooms.map((r) => ({ value: r._id, label: r.roomNumber }))}
          />

          <SelectField
            label="Complaint Type"
            value={form.complaintType}
            onChange={(v) => setForm((p) => ({ ...p, complaintType: v || TYPES[0] }))}
            options={TYPES.map((x) => ({ value: x, label: x }))}
          />

          <SelectField label="Priority" value={form.priority} onChange={(v) => setForm((p) => ({ ...p, priority: v || "Medium" }))} options={["Low","Medium","High","Critical"].map((x) => ({value:x,label:x}))} />

          <Field
            label="Complaint Remarks"
            value={form.remarks}
            onChangeText={(v) => setForm((p) => ({ ...p, remarks: v }))}
            placeholder="Describe the issue clearly"
            multiline
          />

          <Button
            title={attachment ? `Attachment: ${attachment.name}` : "Attach Complaint File"}
            onPress={pickAttachment}
            variant="secondary"
          />
          <Button
            title={busy ? "Submitting..." : "Submit Complaint"}
            onPress={submit}
            disabled={busy}
          />

          {!isAdmin && (
            <Text style={styles.note}>
              Department and Programme are automatically taken from your authenticated user profile.
            </Text>
          )}
        </AppCard>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 27, fontWeight: "900", color: colors.text },
  subtitle: { color: colors.muted, marginTop: 5, marginBottom: 16, lineHeight: 19 },
  card: { paddingVertical: 18 },
  note: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 10 }
});
