const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    programme: { type: mongoose.Schema.Types.ObjectId, ref: "Programme", required: true },
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

blockSchema.index({ department: 1, programme: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Block", blockSchema);
