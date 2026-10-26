const mongoose = require("mongoose");
const { STATUS } = require("../utils/constants");

const complaintSchema = new mongoose.Schema(
  {
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    programme: { type: mongoose.Schema.Types.ObjectId, ref: "Programme", required: true },
    block: { type: mongoose.Schema.Types.ObjectId, ref: "Block", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },

    complaintType: { type: String, required: true },
    remarks: { type: String, required: true },

    attachmentUrl: { type: String },

    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: { type: String, enum: STATUS, default: "Pending" },
    priority: { type: String, enum: ["Low","Medium","High","Critical"], default: "Medium" },
    slaHours: { type: Number, default: 24 },
    dueAt: { type: Date },
    reopenedAt: { type: Date },
    reopenReason: { type: String, trim: true },
    feedback: { rating: { type: Number, min: 1, max: 5 }, comment: { type: String, trim: true }, submittedAt: Date },

    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedAt: { type: Date },
    history: [
      {
        status: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
        note: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
