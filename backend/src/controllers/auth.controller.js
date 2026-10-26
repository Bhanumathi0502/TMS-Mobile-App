const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

exports.bootstrapSuperAdmin = async (req, res, next) => {
  try {
    const exists = await User.findOne({ role: "Superadmin" });
    if (exists) return res.status(400).json({ message: "Superadmin already exists. Use login." });

    const { name, phone, email, password, department, programme } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Required fields missing" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      phone,
      email,
      password: hashed,
      role: "Superadmin",
      department: department || null,
      programme: programme || null
    });

    const token = signToken(user);
    res.status(201).json({ token, user: { ...user.toObject(), password: undefined } });
  } catch (e) {
    next(e);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, phone, email, password, role, department, programme } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, email, password: hashed, role, department, programme });

    const token = signToken(user);
    res.status(201).json({ token, user: { ...user.toObject(), password: undefined } });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email }).populate("department programme");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.json({ token, user: { ...user.toObject(), password: undefined } });
  } catch (e) {
    next(e);
  }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("department", "name shortName")
    .populate("programme", "name shortName department");

  res.json({ user });
};

exports.updateNotificationPreference = async (req, res, next) => {
  try {
    if (typeof req.body.enabled !== "boolean") {
      return res.status(400).json({ message: "Notification preference must be true or false" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { notificationsEnabled: req.body.enabled } },
      { new: true, runValidators: true }
    ).select("notificationsEnabled");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ notificationsEnabled: user.notificationsEnabled });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) {
      const value = String(name).trim();
      if (!value) return res.status(400).json({ message: "Name is required" });
      user.name = value;
    }

    if (email !== undefined) {
      const value = String(email).trim().toLowerCase();
      if (!value) return res.status(400).json({ message: "Email is required" });
      const duplicate = await User.findOne({ email: value, _id: { $ne: userId } });
      if (duplicate) return res.status(400).json({ message: "Email already exists" });
      user.email = value;
    }

    if (phone !== undefined) user.phone = String(phone).trim();

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    const updated = await User.findById(user._id)
      .select("-password")
      .populate("department", "name shortName")
      .populate("programme", "name shortName department");

    res.json({
      message: "Profile updated successfully",
      user: updated
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// =====================================================
// CHANGE PASSWORD
// =====================================================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirmation do not match" });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};
