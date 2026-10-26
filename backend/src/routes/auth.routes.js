const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/auth.controller");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({ destination: uploadDir, filename: (req,file,cb)=>cb(null, `profile-${Date.now()}-${file.originalname.replace(/\s+/g,"_")}`) });
const upload = multer({ storage });

router.post("/bootstrap-superadmin", c.bootstrapSuperAdmin);
router.post("/register", c.register);
router.post("/login", c.login);
router.get("/me", auth, c.me);
router.put("/notification-preference", auth, c.updateNotificationPreference);
router.put("/profile", auth, upload.single("profileImage"), c.updateProfile);
router.put("/change-password", auth, c.changePassword);
module.exports = router;
