const Complaint = require("../models/Complaint");

exports.complaintDetailsReport = async (req, res, next) => {
  try {
    const { department, programme, complaintType, status, assignee } = req.query;

    const q = {};
    if (department) q.department = department;
    if (programme) q.programme = programme;
    if (complaintType) q.complaintType = complaintType;
    if (status) q.status = status;
    if (assignee) q.assignee = assignee;

    const data = await Complaint.find(q)
      .populate("department programme block room")
      .populate("raisedBy", "name email phone role")
      .populate("assignee", "name email phone role")
      .sort({ createdAt: -1 });

    res.json({
      title: "Complaint Details Report",
      count: data.length,
      data
    });
  } catch (e) {
    next(e);
  }
};
