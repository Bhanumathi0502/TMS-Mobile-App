// backend/src/middleware/rbac.js
module.exports = (...allowedRoles) => {
  const allowed = allowedRoles.map((r) => String(r || "").trim().toLowerCase());

  return (req, res, next) => {
    const role = String(req.user?.role || "").trim().toLowerCase();

    if (!role) {
      return res.status(403).json({ message: "Forbidden: role not allowed" });
    }

    // ✅ Superadmin always allowed
    if (role === "superadmin") return next();

    // ✅ allow exact match
    if (allowed.includes(role)) return next();

    // ✅ allow "includes staff" (ex: "networking staff")
    if (allowed.includes("staff") && role.includes("staff")) return next();

    return res.status(403).json({ message: "Forbidden: role not allowed" });
  };
};