const router = require("express").Router();
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/rbac");
const c = require("../controllers/master.controller");

// protect all routes with JWT
router.use(auth);

// ✅ Everyone logged in can READ masters (needed for dropdowns)
router.get("/:type", c.list);

// ✅ Only Superadmin can modify masters
router.post("/:type", allowRoles("Superadmin"), c.create);
router.put("/:type/:id", allowRoles("Superadmin"), c.update);
router.delete("/:type/:id", allowRoles("Superadmin"), c.remove);

module.exports = router;