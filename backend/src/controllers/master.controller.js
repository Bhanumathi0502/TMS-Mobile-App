const Department = require("../models/Department");
const Programme = require("../models/Programme");
const Block = require("../models/Block");
const Room = require("../models/Room");
const Role = require("../models/Role");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

function clean(v) {
  return String(v || "").trim();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findByName(Model, name, notFoundMsg) {
  const n = clean(name);
  if (!n) return null;

  const doc = await Model.findOne({
    name: { $regex: `^${escapeRegex(n)}$`, $options: "i" }
  });

  if (!doc) {
    const err = new Error(notFoundMsg || `Not found: ${n}`);
    err.status = 400;
    throw err;
  }
  return doc;
}

function needsDepartment(role) {
  return clean(role).toLowerCase() !== "superadmin";
}

function isStaffRole(role) {
  const r = clean(role).toLowerCase();
  return [
    "staff",
    "networking staff",
    "plumber",
    "electrician",
    "software developer"
  ].includes(r) || r.includes("staff");
}

exports.list = async (req, res, next) => {
  try {
    const { type } = req.params;
    const models = {
      department: Department,
      programme: Programme,
      block: Block,
      room: Room,
      role: Role,
      user: User
    };

    const Model = models[type];
    if (!Model) return res.status(400).json({ message: "Invalid master type" });

    let query = Model.find().sort({ createdAt: -1 });
    if (type === "user") {
      query = query
        .select("-password")
        .populate("department", "name shortName")
        .populate("programme", "name shortName department");
    }

    const data = await query;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  const { type } = req.params;

  try {
    if (type === "department") {
      const name = clean(req.body.name);
      const shortName = clean(req.body.shortName);
      if (!name || !shortName)
        return res.status(400).json({ message: "Department and Short Name are required" });

      return res.status(201).json(await Department.create({ name, shortName }));
    }

    if (type === "programme") {
      const departmentName = clean(req.body.department);
      const name = clean(req.body.name);
      const shortName = clean(req.body.shortName);

      if (!departmentName || !name || !shortName)
        return res.status(400).json({ message: "Department, Programme and Short Name are required" });

      const dept = await findByName(
        Department,
        departmentName,
        `Department not found: ${departmentName}`
      );

      return res.status(201).json(
        await Programme.create({ department: dept._id, name, shortName })
      );
    }

    if (type === "block") {
      const departmentName = clean(req.body.department);
      const programmeName = clean(req.body.programme);
      const name = clean(req.body.name);

      if (!departmentName || !programmeName || !name)
        return res.status(400).json({ message: "Department, Programme and Block Name are required" });

      const dept = await findByName(
        Department,
        departmentName,
        `Department not found: ${departmentName}`
      );

      const prog = await Programme.findOne({
        department: dept._id,
        name: { $regex: `^${escapeRegex(programmeName)}$`, $options: "i" }
      });

      if (!prog)
        return res.status(400).json({
          message: `Programme not found in ${departmentName}: ${programmeName}`
        });

      return res.status(201).json(
        await Block.create({ department: dept._id, programme: prog._id, name })
      );
    }

    if (type === "room") {
      const departmentName = clean(req.body.department);
      const programmeName = clean(req.body.programme);
      const blockName = clean(req.body.block);
      const roomNumber = clean(req.body.roomNumber);

      if (!departmentName || !programmeName || !blockName || !roomNumber)
        return res.status(400).json({
          message: "Department, Programme, Block and Room Number are required"
        });

      const dept = await findByName(
        Department,
        departmentName,
        `Department not found: ${departmentName}`
      );

      const prog = await Programme.findOne({
        department: dept._id,
        name: { $regex: `^${escapeRegex(programmeName)}$`, $options: "i" }
      });

      if (!prog)
        return res.status(400).json({
          message: `Programme not found in ${departmentName}: ${programmeName}`
        });

      const blk = await Block.findOne({
        department: dept._id,
        programme: prog._id,
        name: { $regex: `^${escapeRegex(blockName)}$`, $options: "i" }
      });

      if (!blk)
        return res.status(400).json({
          message: `Block not found in ${programmeName}: ${blockName}`
        });

      return res.status(201).json(
        await Room.create({
          department: dept._id,
          programme: prog._id,
          block: blk._id,
          roomNumber
        })
      );
    }

    if (type === "role") {
      const name = clean(req.body.name);
      if (!name) return res.status(400).json({ message: "Role Name is required" });
      return res.status(201).json(await Role.create({ name }));
    }

    if (type === "user") {
      const name = clean(req.body.name);
      const phone = clean(req.body.phone);
      const email = clean(req.body.email).toLowerCase();
      const password = clean(req.body.password);
      const role = clean(req.body.role);
      const departmentName = clean(req.body.department);
      const programmeName = clean(req.body.programme);

      if (!name || !phone || !email || !password || !role) {
        return res.status(400).json({
          message: "User Name, Phone Number, Email, Password and Role are required"
        });
      }

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already exists" });

      let deptId = null;
      let progId = null;

      if (needsDepartment(role)) {
        if (!departmentName || !programmeName) {
          return res.status(400).json({
            message: "Department and Programme are required for this user"
          });
        }

        const dept = await findByName(
          Department,
          departmentName,
          `Department not found: ${departmentName}`
        );
        deptId = dept._id;

        const prog = await Programme.findOne({
          department: deptId,
          name: { $regex: `^${escapeRegex(programmeName)}$`, $options: "i" }
        });

        if (!prog) {
          return res.status(400).json({
            message: `Programme not found in ${departmentName}: ${programmeName}`
          });
        }

        progId = prog._id;
      }

      const hashed = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        phone,
        email,
        password: hashed,
        role,
        department: deptId,
        programme: progId
      });

      const obj = user.toObject();
      delete obj.password;
      return res.status(201).json(obj);
    }

    return res.status(400).json({ message: "Invalid master type" });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    if (type !== "user") {
      return res.status(400).json({ message: "Only User update is supported here" });
    }

    const { name, phone, email, password, role, department, programme } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cleanValue = (v) => String(v ?? "").trim();
    const nextRole = cleanValue(role || user.role);
    const isSuperadmin = nextRole.toLowerCase() === "superadmin";

    if (email !== undefined) {
      const nextEmail = cleanValue(email).toLowerCase();
      const duplicate = await User.findOne({ email: nextEmail, _id: { $ne: id } });
      if (duplicate) return res.status(400).json({ message: "Email already exists" });
      user.email = nextEmail;
    }
    if (name !== undefined) user.name = cleanValue(name);
    if (phone !== undefined) user.phone = cleanValue(phone);
    user.role = nextRole;

    if (isSuperadmin) {
      user.department = null;
      user.programme = null;
    } else {
      if (!department || !programme) {
        return res.status(400).json({ message: "Department and Programme are required for this user" });
      }
      const dept = await findByName(Department, department, `Department not found: ${department}`);
      const prog = await Programme.findOne({
        department: dept._id,
        name: { $regex: `^${escapeRegex(cleanValue(programme))}$`, $options: "i" }
      });
      if (!prog) return res.status(400).json({ message: `Programme not found in ${dept.name}: ${programme}` });
      user.department = dept._id;
      user.programme = prog._id;
    }

    if (password && cleanValue(password)) {
      user.password = await bcrypt.hash(cleanValue(password), 10);
    }

    await user.save();

    const updated = await User.findById(id)
      .select("-password")
      .populate("department", "name shortName")
      .populate("programme", "name shortName department");

    res.json({ message: "User updated successfully", user: updated });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const models = {
      department: Department,
      programme: Programme,
      block: Block,
      room: Room,
      role: Role,
      user: User
    };

    const Model = models[type];
    if (!Model) return res.status(400).json({ message: "Invalid master type" });

    await Model.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
};
