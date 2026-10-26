// backend/src/routes/complaint.routes.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/rbac");
const c = require("../controllers/complaint.controller");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

const upload = multer({ storage });

// ✅ Protect all complaint routes with JWT
router.use(auth);

// --------- VIEW ----------
router.get("/dashboard", c.dashboard);
router.get("/analytics", c.analytics);
router.get("/", c.list);
router.get("/:id", c.getById);

// --------- RAISE COMPLAINT ----------
router.post("/", allowRoles("User", "Superadmin"), upload.single("attachment"), c.raise);

// --------- ASSIGN (ONLY SUPERADMIN) ----------
router.put("/:id/assign", allowRoles("Superadmin"), c.assign);

// ✅ STATUS UPDATE (ALL STAFF ROLES + SUPERADMIN)
router.put("/:id/reopen", c.reopen);
router.put("/:id/feedback", c.feedback);

router.put(
  "/:id/status",
  allowRoles("Staff", "Networking Staff", "Plumber", "Electrician", "Software Developer"),
  c.updateStatus
);

module.exports = router;