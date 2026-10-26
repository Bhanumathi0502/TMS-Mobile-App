import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import API, { API_BASE_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Screen from "../components/Screen";
import StatusPill from "../components/StatusPill";
import AppCard from "../components/AppCard";
import SelectField from "../components/SelectField";

const normalize = v => String(v || "").trim().toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");
const staffRole = role => { const r = normalize(role); return r.includes("staff") || ["plumber", "electrician", "software developer"].includes(r); };
const mediaBase = API_BASE_URL.replace(/\/api\/?$/, "");

export default function ComplaintDetailsScreen({ route }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [complaint, setComplaint] = useState(route.params?.complaint || null);
  const [staff, setStaff] = useState([]);
  const [busy, setBusy] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackBusy, setFeedbackBusy] = useState(false);

  const isAdmin = normalize(user?.role) === "superadmin";
  const isStaff = staffRole(user?.role);
  const assignedId = String(complaint?.assignee?._id || complaint?.assignee || "");
  const completed = ["completed", "closed"].includes(normalize(complaint?.status));
  const owner = String(complaint?.raisedBy?._id || complaint?.raisedBy || "") === String(user?._id);
  const canReopen = completed && (isAdmin || owner);
  const slaBreached = Boolean(complaint?.dueAt && new Date(complaint.dueAt).getTime() < Date.now() && !completed);
  const canFeedback = completed && owner && !complaint?.feedback?.rating;

  const load = useCallback(async () => {
    if (!complaint?._id) return;
    try {
      const { data } = await API.get(`/complaints/${complaint._id}`);
      setComplaint(data);
      if (data?.feedback) {
        setRating(data.feedback.rating || 0);
        setFeedbackComment(data.feedback.comment || "");
      }
    } catch (e) {
      console.log("Complaint details load error", e?.response?.data || e?.message);
    }
  }, [complaint?._id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    if (!isAdmin) return;
    API.get("/masters/user").then(({ data }) => setStaff((data || []).filter(x => staffRole(x.role)))).catch(() => setStaff([]));
  }, [isAdmin]);

  const options = useMemo(() => staff.filter(x => String(x._id) !== assignedId).map(x => ({ value: x._id, label: `${x.name} (${x.role})` })), [staff, assignedId]);

  if (!complaint) return null;

  const attachment = complaint.attachmentUrl ? `${mediaBase}${complaint.attachmentUrl}` : null;

  const assign = async id => {
    if (!id) return;
    try {
      setBusy(true);
      const { data } = await API.put(`/complaints/${complaint._id}/assign`, { assigneeId: id });
      setComplaint(data);
      Alert.alert("Success", "Complaint assigned successfully");
    } catch (e) {
      Alert.alert("Assignment Failed", e.response?.data?.message || "Unable to assign complaint");
    } finally { setBusy(false); }
  };

  const updateStatus = async status => {
    try {
      setBusy(true);
      const { data } = await API.put(`/complaints/${complaint._id}/status`, { status });
      setComplaint(data);
      Alert.alert("Success", `Status changed to ${status}`);
    } catch (e) {
      Alert.alert("Update Failed", e.response?.data?.message || "Unable to update status");
    } finally { setBusy(false); }
  };

  const reopen = () => Alert.alert("Reopen Complaint", "The issue is still not resolved. Reopen this complaint?", [
    { text: "Cancel", style: "cancel" },
    { text: "Reopen", style: "destructive", onPress: async () => {
      try {
        setReopening(true);
        const { data } = await API.put(`/complaints/${complaint._id}/reopen`, { reason: "Issue is still not resolved" });
        setComplaint(data);
        Alert.alert("Reopened", "Complaint moved back to Pending.");
      } catch (e) { Alert.alert("Reopen Failed", e.response?.data?.message || "Unable to reopen complaint"); }
      finally { setReopening(false); }
    }}
  ]);

  const submitFeedback = async () => {
    if (!rating) return Alert.alert("Feedback", "Please select a rating.");
    try {
      setFeedbackBusy(true);
      const { data } = await API.put(`/complaints/${complaint._id}/feedback`, { rating, comment: feedbackComment });
      setComplaint(prev => ({ ...prev, feedback: data.feedback }));
      Alert.alert("Thank you", "Your feedback has been submitted.");
    } catch (e) { Alert.alert("Feedback Failed", e.response?.data?.message || "Unable to submit feedback"); }
    finally { setFeedbackBusy(false); }
  };

  return (
    <Screen>
      <AppCard style={styles.card}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.type, { color: colors.text }]}>{complaint.complaintType}</Text>
            <Text style={[styles.id, { color: colors.muted }]}>#{String(complaint._id).slice(-8).toUpperCase()}</Text>
          </View>
          <StatusPill status={complaint.status} />
        </View>

        <View style={[styles.priorityRow, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Metric label="Priority" value={complaint.priority || "Medium"} colors={colors} />
          <Metric label="SLA" value={completed ? "Completed" : slaBreached ? "Breached" : `${complaint.slaHours || 24} hrs`} danger={slaBreached} colors={colors} />
          <Metric label="Due" value={complaint.dueAt ? new Date(complaint.dueAt).toLocaleString() : "-"} colors={colors} />
        </View>

        <Info label="Department" value={complaint.department?.name} colors={colors} />
        <Info label="Programme" value={complaint.programme?.name} colors={colors} />
        <Info label="Block / Room" value={`${complaint.block?.name || "-"} / ${complaint.room?.roomNumber || "-"}`} colors={colors} />
        <Info label="Raised By" value={complaint.raisedBy?.name || "-"} colors={colors} />
        <Info label="Assignee" value={complaint.assignee?.name || "Not assigned"} colors={colors} />
        <Info label="Remarks" value={complaint.remarks} colors={colors} />

        {isAdmin && !completed && (
          <View style={styles.control}>
            <SelectField label={assignedId ? "Reassign Staff" : "Assign Staff"} value="" onChange={assign} options={options} placeholder={assignedId ? "Choose new staff" : "Choose staff"} />
            {busy ? <ActivityIndicator color={colors.primary} /> : null}
          </View>
        )}

        {isStaff && assignedId === String(user?._id) && !completed && (
          <View style={styles.control}>
            <SelectField label="Update Status" value="" onChange={updateStatus} options={[{ value: "In-Progress", label: "In-Progress" }, { value: "Onhold", label: "On Hold" }, { value: "Completed", label: "Completed" }]} placeholder="Choose status" />
          </View>
        )}

        <View style={[styles.timelineBox, { borderTopColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Complaint Timeline</Text>
          {(complaint.history || []).length ? complaint.history.map((h, i) => (
            <View style={styles.timelineRow} key={`${h.at || i}-${i}`}>
              <View style={styles.timelineRail}><View style={[styles.dot, { backgroundColor: colors.primary }]} />{i < complaint.history.length - 1 ? <View style={[styles.line, { backgroundColor: colors.border }]} /> : null}</View>
              <View style={{ flex: 1, paddingBottom: 16 }}>
                <Text style={[styles.timelineStatus, { color: colors.text }]}>{h.status || "Update"}</Text>
                <Text style={[styles.timelineNote, { color: colors.muted }]}>{h.note || "Status updated"}{h.by?.name ? ` • ${h.by.name}` : ""}</Text>
                <Text style={[styles.timelineTime, { color: colors.muted }]}>{h.at ? new Date(h.at).toLocaleString() : "-"}</Text>
              </View>
            </View>
          )) : <Text style={{ color: colors.muted, fontSize: 12 }}>No timeline updates available.</Text>}
        </View>

        {canReopen && <TouchableOpacity style={styles.reopen} onPress={reopen} disabled={reopening}><Text style={styles.reopenText}>{reopening ? "Reopening..." : "Reopen Complaint"}</Text></TouchableOpacity>}

        {canFeedback && (
          <View style={[styles.feedback, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Rate the Service</Text>
            <View style={styles.stars}>{[1,2,3,4,5].map(n => <TouchableOpacity key={n} onPress={() => setRating(n)}><Ionicons name={n <= rating ? "star" : "star-outline"} size={28} color={n <= rating ? "#F59E0B" : colors.muted} /></TouchableOpacity>)}</View>
            <TextInput value={feedbackComment} onChangeText={setFeedbackComment} placeholder="Optional comment" placeholderTextColor={colors.muted} multiline style={[styles.feedbackInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} />
            <TouchableOpacity style={[styles.feedbackButton, { backgroundColor: colors.primary }]} onPress={submitFeedback} disabled={feedbackBusy}><Text style={styles.feedbackButtonText}>{feedbackBusy ? "Submitting..." : "Submit Feedback"}</Text></TouchableOpacity>
          </View>
        )}

        {complaint.feedback?.rating ? <View style={[styles.feedback, { backgroundColor: colors.input, borderColor: colors.border }]}><Text style={[styles.sectionTitle, { color: colors.text }]}>Your Feedback</Text><Text style={{ color: "#F59E0B", fontSize: 20 }}>{"★".repeat(complaint.feedback.rating)}{"☆".repeat(5 - complaint.feedback.rating)}</Text>{complaint.feedback.comment ? <Text style={{ color: colors.muted, marginTop: 5 }}>{complaint.feedback.comment}</Text> : null}</View> : null}

        {attachment && <TouchableOpacity style={[styles.attachment, { backgroundColor: colors.input, borderColor: colors.border }]} onPress={() => Linking.openURL(attachment)}><Ionicons name="attach-outline" size={18} color={colors.primary} /><Text style={[styles.attachmentText, { color: colors.primary }]}>Open Complaint Attachment</Text></TouchableOpacity>}
      </AppCard>
    </Screen>
  );
}

function Metric({ label, value, danger, colors }) { return <View style={styles.metric}><Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text><Text style={[styles.metricValue, { color: danger ? "#DC2626" : colors.text }]}>{value}</Text></View>; }
function Info({ label, value, colors }) { return <View style={[styles.info, { borderBottomColor: colors.border }]}><Text style={[styles.label, { color: colors.muted }]}>{label}</Text><Text style={[styles.value, { color: colors.text }]}>{value || "-"}</Text></View>; }

const styles = StyleSheet.create({
  card: { padding: 16 }, headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 }, type: { fontSize: 20, fontWeight: "900" }, id: { fontSize: 9, marginTop: 3, fontWeight: "700" },
  priorityRow: { flexDirection: "row", justifyContent: "space-between", borderRadius: 12, borderWidth: 1, padding: 11, marginBottom: 8 }, metric: { flex: 1, paddingHorizontal: 5 }, metricLabel: { fontSize: 9, fontWeight: "800", textTransform: "uppercase" }, metricValue: { fontSize: 12, fontWeight: "900", marginTop: 4 }, info: { paddingVertical: 10, borderBottomWidth: 1 }, label: { fontSize: 10, fontWeight: "800" }, value: { fontSize: 13, fontWeight: "700", marginTop: 3, lineHeight: 19 }, control: { marginTop: 14 }, timelineBox: { marginTop: 18, paddingTop: 15, borderTopWidth: 1 }, sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 }, timelineRow: { flexDirection: "row" }, timelineRail: { width: 20, alignItems: "center" }, dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 }, line: { width: 2, flex: 1, marginTop: 3 }, timelineStatus: { fontSize: 13, fontWeight: "900" }, timelineNote: { fontSize: 11, marginTop: 2 }, timelineTime: { fontSize: 9, marginTop: 4 }, reopen: { marginTop: 12, backgroundColor: "#FEF2F2", borderColor: "#FCA5A5", borderWidth: 1, borderRadius: 12, padding: 13, alignItems: "center" }, reopenText: { color: "#B91C1C", fontWeight: "900" }, feedback: { marginTop: 16, padding: 14, borderWidth: 1, borderRadius: 14 }, stars: { flexDirection: "row", gap: 7, marginBottom: 10 }, feedbackInput: { minHeight: 78, borderWidth: 1, borderRadius: 10, padding: 10, textAlignVertical: "top" }, feedbackButton: { marginTop: 9, padding: 12, borderRadius: 10, alignItems: "center" }, feedbackButtonText: { color: "#fff", fontWeight: "900" }, attachment: { marginTop: 14, padding: 12, borderRadius: 11, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }, attachmentText: { fontWeight: "900" }
});
