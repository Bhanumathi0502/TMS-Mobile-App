export function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function getLifecycleDates(complaint) {
  const history = Array.isArray(complaint?.history) ? complaint.history : [];
  const raisedAt = complaint?.createdAt || history.find((item) => item?.status === "Pending")?.at || null;
  const assignedAt = complaint?.assignedAt || history.find((item) => item?.status === "Assigned")?.at || null;
  const completedAt = complaint?.completedAt || history.slice().reverse().find((item) => item?.status === "Completed")?.at || null;

  return {
    raised: formatDate(raisedAt) || "-",
    assigned: assignedAt ? formatDate(assignedAt) : "Not assigned",
    closed: completedAt ? formatDate(completedAt) : "Not closed yet"
  };
}
