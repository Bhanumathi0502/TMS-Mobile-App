const mongoose = require("mongoose");

const programmeSchema = new mongoose.Schema(
  {
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    name: { type: String, required: true, trim: true },
    shortName: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

programmeSchema.index({ department: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Programme", programmeSchema);
