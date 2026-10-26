const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    profileImage: { type: String, trim: true, default: "" },
    notificationsEnabled: { type: Boolean, default: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    programme: { type: mongoose.Schema.Types.ObjectId, ref: "Programme" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
