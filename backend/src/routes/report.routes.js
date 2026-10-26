const router = require("express").Router();
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/rbac");
const c = require("../controllers/report.controller");

router.use(auth);
router.get("/complaints", allowRoles("Superadmin"), c.complaintDetailsReport);

module.exports = router;
