function normalizeComplaintStatus(status) {
  const value = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");

  // Pending
  if (
    value === "pending" ||
    value === "p"
  ) {
    return "pending";
  }

  // Assigned
  if (
    value === "assigned" ||
    value === "assign" ||
    value === "assigned to"
  ) {
    return "assigned";
  }

  // In Progress
  if (
    value === "in progress" ||
    value === "inprogress" ||
    value === "working"
  ) {
    return "in-progress";
  }

  // On Hold
  if (
    value === "on hold" ||
    value === "onhold" ||
    value === "hold"
  ) {
    return "on-hold";
  }

  // Completed / Closed
  if (
    value === "completed" ||
    value === "complete" ||
    value === "closed" ||
    value === "close" ||
    value === "done"
  ) {
    return "completed";
  }

  return value.replace(/\s+/g, "-");
}

module.exports = {
  normalizeComplaintStatus
};