const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    programme: { type: mongoose.Schema.Types.ObjectId, ref: "Programme", required: true },
    block: { type: mongoose.Schema.Types.ObjectId, ref: "Block", required: true },
    roomNumber: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

roomSchema.index({ block: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model("Room", roomSchema);
