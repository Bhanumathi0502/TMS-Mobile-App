function normalizeComplaintStatus(status) {
  const value = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");

  if (!value) {
    return "unknown";
  }

  // Pending
  if (["pending", "p"].includes(value)) {
    return "pending";
  }

  // Assigned
  if (
    ["assigned", "assign", "assigned to"].includes(value)
  ) {
    return "assigned";
  }

  // In Progress
  if (
    [
      "in progress",
      "inprogress",
      "working"
    ].includes(value)
  ) {
    return "in-progress";
  }

  // On Hold
  if (
    [
      "on hold",
      "onhold",
      "hold"
    ].includes(value)
  ) {
    return "on-hold";
  }

  // Completed / Closed
  if (
    [
      "completed",
      "complete",
      "closed",
      "close",
      "done"
    ].includes(value)
  ) {
    return "completed";
  }

  return value.replace(/\s+/g, "-");
}

module.exports = {
  normalizeComplaintStatus
};