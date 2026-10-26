const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Block = require("../models/Block");
const Room = require("../models/Room");
const mongoose = require("mongoose");
const SLA_HOURS = { Low: 48, Medium: 24, High: 8, Critical: 2 };
const priorityHours = p => SLA_HOURS[p] || 24;
async function notifyUsers(ids,title,message,complaint){ const unique=[...new Set((ids||[]).filter(Boolean).map(String))]; if(!unique.length)return; const recipients=await User.find({_id:{$in:unique},notificationsEnabled:{$ne:false}}).select("_id").lean(); if(recipients.length)await Notification.insertMany(recipients.map(({_id})=>({user:_id,title,message,complaint}))); }

// ======================================================
// STAFF ROLES
// ======================================================

const STAFF_ROLES = [
  "Staff",
  "Networking Staff",
  "Plumber",
  "Electrician",
  "Software Developer"
];

// ======================================================
// NORMALIZE VALUE
// ======================================================

const normalize = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

// ======================================================
// CHECK STAFF
// ======================================================

function isStaff(role) {
  const r = normalize(role);

  return (
    STAFF_ROLES.some(
      (item) => normalize(item) === r
    ) ||
    r.includes("staff")
  );
}

// ======================================================
// NORMALIZE COMPLAINT STATUS
// ======================================================

function normalizeStatus(status) {
  return String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");
}

// ======================================================
// RAISE COMPLAINT
// ======================================================

exports.raise = async (req, res, next) => {
  try {
    const role = normalize(req.user.role);

    const { block, room, complaintType, remarks, priority = "Medium" } = req.body;

    if (
      !block ||
      !room ||
      !complaintType ||
      !remarks?.trim()
    ) {
      return res.status(400).json({
        message:
          "Block, Room, Complaint Type and Remarks are required"
      });
    }

    let department = req.user.department;
    let programme = req.user.programme;

    // SuperAdmin can select department/programme
    if (role === "superadmin") {
      department =
        req.body.department || department;

      programme =
        req.body.programme || programme;
    }

    if (!department || !programme) {
      return res.status(400).json({
        message:
          "Department and Programme are required for this complaint"
      });
    }

    if ([department, programme, block, room].some(id => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({ message: "Select a valid department, programme, block and room" });
    }

    const [selectedBlock, selectedRoom] = await Promise.all([
      Block.findById(block).select("department programme"),
      Room.findById(room).select("department programme block")
    ]);

    if (!selectedBlock || !selectedRoom) {
      return res.status(400).json({ message: "Selected block or room was not found" });
    }

    const matchesOrganization = item =>
      String(item.department) === String(department) && String(item.programme) === String(programme);
    if (!matchesOrganization(selectedBlock) || !matchesOrganization(selectedRoom) || String(selectedRoom.block) !== String(block)) {
      return res.status(400).json({ message: "Selected block and room must belong to the selected department and programme" });
    }

    const attachmentUrl = req.file
      ? `/uploads/${req.file.filename}`
      : undefined;

    const selectedPriority=["Low","Medium","High","Critical"].includes(priority)?priority:"Medium";
    const dueAt=new Date(Date.now()+priorityHours(selectedPriority)*3600000);
    const complaint = await Complaint.create({
      department,
      programme,
      block,
      room,
      complaintType,
      remarks: remarks.trim(),
      attachmentUrl,

      // New complaint = Pending
      status: "Pending",
      priority: selectedPriority,
      slaHours: priorityHours(selectedPriority),
      dueAt,

      raisedBy: req.user._id,

      history: [
        {
          status: "Pending",
          by: req.user._id,
          note: "Complaint raised"
        }
      ]
    });

    const admins=await User.find({role:{ $regex:/^superadmin$/i }}).select("_id");
    await notifyUsers(admins.map(x=>x._id),"New Complaint Raised",`${req.user.name||"A user"} raised a ${selectedPriority} priority complaint.`,complaint._id);
    await notifyUsers([req.user._id],"Complaint Received","We have received your complaint and will resolve the problem within 2 days. You will receive updates as work progresses.",complaint._id);

    const populated =
      await Complaint.findById(
        complaint._id
      )
        .populate(
          "department programme block room"
        )
        .populate(
          "raisedBy",
          "name email phone role"
        )
        .populate(
          "assignee",
          "name email phone role"
        );

    return res.status(201).json(populated);

  } catch (error) {
    next(error);
  }
};

// ======================================================
// DASHBOARD
// ======================================================
//
// SUPERADMIN → ALL COMPLAINTS
// USER       → OWN COMPLAINTS
// STAFF      → ASSIGNED COMPLAINTS
//
// TOTAL    → All complaints
// PENDING  → Pending
// ASSIGNED → Assigned
// CLOSED   → Completed / Closed
//
// ======================================================

exports.dashboard = async (req, res, next) => {
  try {
    const role = normalize(req.user.role);

    let match = {};

    // --------------------------------------------------
    // USER
    // --------------------------------------------------

    if (role === "user") {
      match.raisedBy = req.user._id;
    }

    // --------------------------------------------------
    // STAFF / TECHNICIAN
    // --------------------------------------------------

    else if (isStaff(req.user.role)) {
      match.assignee = req.user._id;
    }

    // --------------------------------------------------
    // SUPERADMIN
    // --------------------------------------------------
    // No filter.
    // SuperAdmin sees all complaints.

    const complaints =
      await Complaint.find(match)
        .select("status")
        .lean();

    let total = complaints.length;
    let pending = 0;
    let assigned = 0;
    let closed = 0;

    // --------------------------------------------------
    // COUNT EACH STATUS
    // --------------------------------------------------

    complaints.forEach((complaint) => {
      const status = normalizeStatus(complaint.status);

      // PENDING
      if (
        status === "pending" ||
        status === "p" ||
        status === "onhold" ||
        status === "on hold"
      ) {
        pending++;
        return;
      }

      if (
        status === "assigned" ||
        status === "assign" ||
        status === "assigned to"
      ) {
        assigned++;
        return;
      }

      if (
        status === "completed" ||
        status === "complete" ||
        status === "closed" ||
        status === "close" ||
        status === "done"
      ) {
        closed++;
        return;
      }
    });

    // --------------------------------------------------
    // DEBUG
    // --------------------------------------------------

    console.log(
      "======================================"
    );

    console.log(
      "DASHBOARD USER:",
      req.user.name
    );

    console.log(
      "DASHBOARD ROLE:",
      req.user.role
    );

    console.log(
      "RAW STATUSES:",
      complaints.map(
        (complaint) =>
          complaint.status
      )
    );

    console.log(
      "TOTAL:",
      total
    );

    console.log(
      "PENDING:",
      pending
    );

    console.log(
      "ASSIGNED:",
      assigned
    );

    console.log(
      "CLOSED:",
      closed
    );

    console.log(
      "======================================"
    );

    return res.json({
      total,
      pending,
      assigned,
      closed
    });

  } catch (error) {
    console.error(
      "Dashboard Error:",
      error
    );

    next(error);
  }
};

// ======================================================
// GET SINGLE COMPLAINT
// ======================================================

exports.getById = async (req, res, next) => {
  try {
    const role = normalize(req.user.role);
    const query = { _id: req.params.id };
    if (role === "user") query.raisedBy = req.user._id;
    else if (isStaff(req.user.role)) query.assignee = req.user._id;

    const data = await Complaint.findOne(query)
      .populate("department programme block room")
      .populate("raisedBy", "name email phone role")
      .populate("assignee", "name email phone role")
      .populate("history.by", "name role");

    if (!data) return res.status(404).json({ message: "Complaint not found" });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// COMPLAINT LIST
// ======================================================

exports.list = async (req, res, next) => {
  try {
    const role = normalize(req.user.role);

    const query = {};

    // USER → own complaints
    if (role === "user") {
      query.raisedBy = req.user._id;
    }

    // STAFF → assigned complaints
    else if (isStaff(req.user.role)) {
      query.assignee = req.user._id;
    }

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Complaint type filter
    if (req.query.complaintType) query.complaintType = req.query.complaintType;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.assignee) query.assignee = req.query.assignee;
    if (req.query.search) {
      const term=String(req.query.search).trim();
      const users=await User.find({name:{$regex:term,$options:"i"}}).select("_id");
      query.$or=[{remarks:{$regex:term,$options:"i"}},{complaintType:{$regex:term,$options:"i"}},{raisedBy:{$in:users.map(x=>x._id)}}];
      if (/^[a-fA-F0-9]{24}$/.test(term)) query.$or.push({_id:term});
    }

    const data =
      await Complaint.find(query)
        .populate(
          "department programme block room"
        )
        .populate(
          "raisedBy",
          "name email phone role"
        )
        .populate(
          "assignee",
          "name email phone role"
        )
        .populate("history.by", "name role")
        .sort({
          createdAt: -1
        });

    return res.json(data);

  } catch (error) {
    next(error);
  }
};

// ======================================================
// ASSIGN / REASSIGN
// ======================================================

exports.assign = async (req, res, next) => {
  try {
    const {
      assigneeId
    } = req.body;

    const complaintId =
      req.params.id;

    if (!assigneeId) {
      return res.status(400).json({
        message:
          "Assignee is required"
      });
    }

    const complaint =
      await Complaint.findById(
        complaintId
      );

    if (!complaint) {
      return res.status(404).json({
        message:
          "Complaint not found"
      });
    }

    // Completed cannot be reassigned
    if (
      normalizeStatus(
        complaint.status
      ) === "completed"
    ) {
      return res.status(400).json({
        message:
          "Completed complaints cannot be reassigned"
      });
    }

    const staff =
      await User.findById(
        assigneeId
      );

    if (!staff) {
      return res.status(404).json({
        message:
          "Assignee not found"
      });
    }

    if (!isStaff(staff.role)) {
      return res.status(400).json({
        message:
          "Complaint can only be assigned to Technician/Staff roles"
      });
    }

    // Same department validation
    if (
      staff.department &&
      complaint.department &&
      String(staff.department) !==
      String(complaint.department)
    ) {
      return res.status(400).json({
        message:
          "Assignee must belong to the complaint department"
      });
    }

    complaint.assignee =
      staff._id;

    complaint.status =
      "Assigned";

    complaint.assignedAt =
      new Date();

    complaint.history.push({
      status: "Assigned",
      by: req.user._id,
      note:
        `Assigned to ${staff.name}`
    });

    await complaint.save();

    const complaintRef = String(complaint._id).slice(-8).toUpperCase();
    await notifyUsers([staff._id],"New Complaint Assigned",`Complaint ${complaintRef} has been assigned to you.`,complaint._id);
    await notifyUsers([complaint.raisedBy],"Complaint Assigned",`Complaint ${complaintRef} was assigned to ${staff.name}.`,complaint._id);

    const populated =
      await Complaint.findById(
        complaint._id
      )
        .populate(
          "department programme block room"
        )
        .populate(
          "raisedBy",
          "name email phone role"
        )
        .populate(
          "assignee",
          "name email phone role"
        );

    return res.json(
      populated
    );

  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE STATUS
// ======================================================
//
// ASSIGNED
//    ↓
// IN-PROGRESS
//    ↓
// ONHOLD
//    ↓
// COMPLETED
//
// ======================================================

exports.updateStatus = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
      note
    } = req.body;

    const complaintId =
      req.params.id;

    const allowedStatuses = [
      "In-Progress",
      "Onhold",
      "Completed"
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          "Staff can set only In-Progress, Onhold or Completed"
      });
    }

    const complaint =
      await Complaint.findById(
        complaintId
      );

    if (!complaint) {
      return res.status(404).json({
        message:
          "Complaint not found"
      });
    }

    // Only assigned staff
    if (
      !complaint.assignee ||
      complaint.assignee.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Only the assigned staff can update this complaint"
      });
    }

    complaint.status =
      status;

    complaint.history.push({ status, by: req.user._id, note: note || "" });
    await complaint.save();
    const admins = await User.find({ role: { $regex: /^superadmin$/i } }).select("_id");
    const complaintRef = String(complaint._id).slice(-8).toUpperCase();
    await notifyUsers(admins.map(admin => admin._id),"Complaint Status Updated",`Complaint ${complaintRef} was updated to ${status} by ${req.user.name || "the assigned staff"}.`,complaint._id);
    await notifyUsers([complaint.raisedBy],"Complaint Status Updated",`Your complaint status changed to ${status}.`,complaint._id);

    const populated =
      await Complaint.findById(
        complaint._id
      )
        .populate(
          "department programme block room"
        )
        .populate(
          "raisedBy",
          "name email phone role"
        )
        .populate(
          "assignee",
          "name email phone role"
        );

    return res.json(
      populated
    );

  } catch (error) {
    next(error);
  }
};
exports.reopen=async(req,res,next)=>{try{const c=await Complaint.findById(req.params.id);if(!c)return res.status(404).json({message:"Complaint not found"});const role=normalize(req.user.role),owner=String(c.raisedBy)===String(req.user._id);if(role!=="superadmin"&&!owner)return res.status(403).json({message:"Only complaint owner or Superadmin can reopen"});if(!["completed","closed"].includes(normalizeStatus(c.status)))return res.status(400).json({message:"Only completed/closed complaints can be reopened"});const reason=String(req.body.reason||"Issue is still not resolved").trim();c.status="Pending";c.reopenedAt=new Date();c.reopenReason=reason;c.dueAt=new Date(Date.now()+(c.slaHours||24)*3600000);c.history.push({status:"Pending",by:req.user._id,note:`Reopened: ${reason}`});await c.save();const admins=await User.find({role:{$regex:/^superadmin$/i}}).select("_id");await notifyUsers([...admins.map(x=>x._id),c.assignee],"Complaint Reopened",`Complaint ${String(c._id).slice(-8).toUpperCase()} has been reopened.`,c._id);const out=await Complaint.findById(c._id).populate("department programme block room").populate("raisedBy","name email phone role").populate("assignee","name email phone role");res.json(out);}catch(e){next(e)}};
exports.feedback=async(req,res,next)=>{try{const rating=Number(req.body.rating);if(!Number.isInteger(rating)||rating<1||rating>5)return res.status(400).json({message:"Rating must be between 1 and 5"});const c=await Complaint.findById(req.params.id);if(!c)return res.status(404).json({message:"Complaint not found"});if(String(c.raisedBy)!==String(req.user._id))return res.status(403).json({message:"Only complaint owner can submit feedback"});if(!["completed","closed"].includes(normalizeStatus(c.status)))return res.status(400).json({message:"Feedback is available after completion"});c.feedback={rating,comment:String(req.body.comment||"").trim(),submittedAt:new Date()};await c.save();res.json({message:"Feedback submitted successfully",feedback:c.feedback});}catch(e){next(e)}};
exports.analytics=async(req,res,next)=>{try{const role=normalize(req.user.role),match={};if(role==="user")match.raisedBy=req.user._id;else if(isStaff(req.user.role))match.assignee=req.user._id;const rows=await Complaint.find(match).select("status priority dueAt").lean();const byPriority={Low:0,Medium:0,High:0,Critical:0},byStatus={};rows.forEach(x=>{const p=x.priority||"Medium";byPriority[p]=(byPriority[p]||0)+1;byStatus[x.status]=(byStatus[x.status]||0)+1});const now=Date.now(),slaBreached=rows.filter(x=>x.dueAt&&new Date(x.dueAt)<now&&!['Completed','Closed'].includes(x.status)).length;res.json({total:rows.length,byPriority,byStatus,slaBreached});}catch(e){next(e)}};
