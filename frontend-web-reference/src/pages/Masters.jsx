import { useEffect, useMemo, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

const TABS = [
  { key: "department", label: "Department" },
  { key: "programme", label: "Programme" },
  { key: "block", label: "Block" },
  { key: "room", label: "Room Number" },
  { key: "role", label: "Role" },
  { key: "user", label: "User" }
];

export default function Masters() {
  const [tab, setTab] = useState("department");

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [list, setList] = useState([]);

  // masters data for dropdowns
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [blocks, setBlocks] = useState([]);

  // forms
  const [depForm, setDepForm] = useState({ name: "", shortName: "" });

  const [progForm, setProgForm] = useState({
    department: "",
    name: "",
    shortName: ""
  });

  const [blockForm, setBlockForm] = useState({
    department: "",
    programme: "",
    name: ""
  });

  const [roomForm, setRoomForm] = useState({
    department: "",
    programme: "",
    block: "",
    roomNumber: ""
  });

  const [roleForm, setRoleForm] = useState({ name: "" });

  const [userForm, setUserForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "User",
    department: "",
    programme: ""
  });

  // ✅ Only User & Superadmin need Department/Programme
  const needsDeptProg = (role) => {
    const r = String(role || "").toLowerCase();
    return r === "user" || r === "superadmin";
  };

  // ---------- helpers ----------
  const toast = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 1600);
  };

  const resetMessages = () => {
    setErr("");
    setMsg("");
  };

  const loadList = async () => {
    resetMessages();
    try {
      const res = await API.get(`/masters/${tab}`);
      setList(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Load failed");
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await API.get("/masters/department");
      setDepartments(res.data || []);
    } catch {}
  };

  const loadProgrammes = async () => {
    try {
      const res = await API.get("/masters/programme");
      setProgrammes(res.data || []);
    } catch {}
  };

  const loadBlocks = async () => {
    try {
      const res = await API.get("/masters/block");
      setBlocks(res.data || []);
    } catch {}
  };

  // initial load + on tab change
  useEffect(() => {
    loadList();
    loadDepartments();
    loadProgrammes();
    loadBlocks();
    // eslint-disable-next-line
  }, [tab]);

  // programmes shown (we keep all; backend validates dept+programme)
  const programmesForDept = useMemo(() => {
    return programmes;
  }, [programmes]);

  const blocksForProg = useMemo(() => {
    return blocks;
  }, [blocks]);

  // ---------- create handlers ----------
  const createDepartment = async () => {
    resetMessages();
    try {
      if (!depForm.name || !depForm.shortName) return setErr("Fill all fields");
      await API.post("/masters/department", depForm);
      toast("✅ Department created");
      setDepForm({ name: "", shortName: "" });
      loadDepartments();
      loadList();
    } catch (e) {
      setErr(e.response?.data?.message || "Create failed");
    }
  };

  const createProgramme = async () => {
    resetMessages();
    try {
      if (!progForm.department || !progForm.name || !progForm.shortName) return setErr("Fill all fields");
      await API.post("/masters/programme", progForm);
      toast("✅ Programme created");
      setProgForm({ department: "", name: "", shortName: "" });
      loadProgrammes();
      loadList();
    } catch (e) {
      setErr(e.response?.data?.message || "Create failed");
    }
  };

  const createBlock = async () => {
    resetMessages();
    try {
      if (!blockForm.department || !blockForm.programme || !blockForm.name) return setErr("Fill all fields");
      await API.post("/masters/block", blockForm);
      toast("✅ Block created");
      setBlockForm({ department: "", programme: "", name: "" });
      loadBlocks();
      loadList();
    } catch (e) {
      setErr(e.response?.data?.message || "Create failed");
    }
  };

  const createRoom = async () => {
    resetMessages();
    try {
      if (!roomForm.department || !roomForm.programme || !roomForm.block || !roomForm.roomNumber)
        return setErr("Fill all fields");
      await API.post("/masters/room", roomForm);
      toast("✅ Room created");
      setRoomForm({ department: "", programme: "", block: "", roomNumber: "" });
      loadList();
    } catch (e) {
      setErr(e.response?.data?.message || "Create failed");
    }
  };

  const createRole = async () => {
    resetMessages();
    try {
      if (!roleForm.name) return setErr("Enter role name");
      await API.post("/masters/role", roleForm);
      toast("✅ Role created");
      setRoleForm({ name: "" });
      loadList();
    } catch (e) {
      setErr(e.response?.data?.message || "Create failed");
    }
  };

  const createUser = async () => {
    resetMessages();
    try {
      const { name, email, password, role } = userForm;
      if (!name || !email || !password || !role) return setErr("Fill required fields");

      // ✅ Dept required only for User/Superadmin
      if (needsDeptProg(role) && !userForm.department) {
        return setErr("Department is required for User/Superadmin");
      }

      await API.post("/masters/user", userForm);
      toast("✅ User created");
      setUserForm({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "User",
        department: "",
        programme: ""
      });
      loadList();
    } catch (e) {
      setErr(e.response?.data?.message || "Create failed");
    }
  };

  const del = async (id) => {
    resetMessages();
    try {
      await API.delete(`/masters/${tab}/${id}`);
      toast("✅ Deleted");
      loadList();
    } catch (e) {
      setErr(e.response?.data?.message || "Delete failed");
    }
  };

  // ---------- UI ----------
  return (
    <div>
      <Navbar />

      <div className="container">
        <h1>Masters</h1>

        {err && <div className="alert">{err}</div>}
        {msg && <div className="success">{msg}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 14 }}>
          {/* Left tabs */}
          <div className="card">
            <div className="muted tiny" style={{ marginBottom: 10 }}>
              Only Superadmin can access
            </div>

            {TABS.map((t) => (
              <button
                key={t.key}
                className={`btn ${tab === t.key ? "" : "ghost"}`}
                style={{ width: "100%", marginBottom: 10 }}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}

            <button className="btn ghost" style={{ width: "100%" }} onClick={loadList}>
              Refresh List
            </button>
          </div>

          {/* Right content */}
          <div>
            {/* Forms */}
            <div className="card form">
              {tab === "department" && (
                <>
                  <h3>Department</h3>
                  <label>Department</label>
                  <input
                    value={depForm.name}
                    onChange={(e) => setDepForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: MCA"
                  />
                  <label>Department Short Name</label>
                  <input
                    value={depForm.shortName}
                    onChange={(e) => setDepForm((p) => ({ ...p, shortName: e.target.value }))}
                    placeholder="Ex: MCA"
                  />
                  <button className="btn" onClick={createDepartment}>
                    Save Department
                  </button>
                </>
              )}

              {tab === "programme" && (
                <>
                  <h3>Programme</h3>
                  <label>Department</label>
                  <select
                    value={progForm.department}
                    onChange={(e) => setProgForm((p) => ({ ...p, department: e.target.value }))}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  <label>Programme</label>
                  <input
                    value={progForm.name}
                    onChange={(e) => setProgForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: MCA"
                  />

                  <label>Programme Short Name</label>
                  <input
                    value={progForm.shortName}
                    onChange={(e) => setProgForm((p) => ({ ...p, shortName: e.target.value }))}
                    placeholder="Ex: MCA"
                  />

                  <button className="btn" onClick={createProgramme}>
                    Save Programme
                  </button>
                </>
              )}

              {tab === "block" && (
                <>
                  <h3>Block</h3>
                  <label>Department</label>
                  <select
                    value={blockForm.department}
                    onChange={(e) =>
                      setBlockForm((p) => ({ ...p, department: e.target.value, programme: "" }))
                    }
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  <label>Programme</label>
                  <select
                    value={blockForm.programme}
                    onChange={(e) => setBlockForm((p) => ({ ...p, programme: e.target.value }))}
                  >
                    <option value="">Select Programme</option>
                    {programmesForDept.map((p) => (
                      <option key={p._id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <label>Block Name</label>
                  <input
                    value={blockForm.name}
                    onChange={(e) => setBlockForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Block A"
                  />

                  <button className="btn" onClick={createBlock}>
                    Save Block
                  </button>
                </>
              )}

              {tab === "room" && (
                <>
                  <h3>Room Number</h3>
                  <label>Department</label>
                  <select
                    value={roomForm.department}
                    onChange={(e) =>
                      setRoomForm((p) => ({ ...p, department: e.target.value, programme: "", block: "" }))
                    }
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  <label>Programme</label>
                  <select
                    value={roomForm.programme}
                    onChange={(e) => setRoomForm((p) => ({ ...p, programme: e.target.value, block: "" }))}
                  >
                    <option value="">Select Programme</option>
                    {programmesForDept.map((p) => (
                      <option key={p._id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <label>Block</label>
                  <select
                    value={roomForm.block}
                    onChange={(e) => setRoomForm((p) => ({ ...p, block: e.target.value }))}
                  >
                    <option value="">Select Block</option>
                    {blocksForProg.map((b) => (
                      <option key={b._id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>

                  <label>Room Number</label>
                  <input
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm((p) => ({ ...p, roomNumber: e.target.value }))}
                    placeholder="Ex: 101"
                  />

                  <button className="btn" onClick={createRoom}>
                    Save Room
                  </button>
                </>
              )}

              {tab === "role" && (
                <>
                  <h3>Role</h3>
                  <label>Role Name</label>
                  <input
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ name: e.target.value })}
                    placeholder="Ex: Electrician"
                  />
                  <button className="btn" onClick={createRole}>
                    Save Role
                  </button>
                </>
              )}

              {tab === "user" && (
                <>
                  <h3>User</h3>
                  <label>User Name</label>
                  <input
                    value={userForm.name}
                    onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Ram"
                  />

                  <label>Phone Number</label>
                  <input
                    value={userForm.phone}
                    onChange={(e) => setUserForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Ex: 9999999999"
                  />

                  <label>Email</label>
                  <input
                    value={userForm.email}
                    onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Ex: ram@gmail.com"
                  />

                  <label>Password</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Ex: 123456"
                  />

                  <label>Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setUserForm((p) => ({
                        ...p,
                        role: newRole,
                        department: needsDeptProg(newRole) ? p.department : "",
                        programme: needsDeptProg(newRole) ? p.programme : ""
                      }));
                    }}
                  >
                    <option value="User">User</option>
                    <option value="Staff">Staff</option>
                    <option value="Superadmin">Superadmin</option>
                    <option value="Networking Staff">Networking Staff</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Software Developer">Software Developer</option>
                  </select>

                  {/* ✅ Show Dept/Prog only for User/Superadmin */}
                  {needsDeptProg(userForm.role) && (
                    <>
                      <label>Department</label>
                      <select
                        value={userForm.department}
                        onChange={(e) =>
                          setUserForm((p) => ({ ...p, department: e.target.value, programme: "" }))
                        }
                      >
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>

                      <label>Programme</label>
                      <select
                        value={userForm.programme}
                        onChange={(e) => setUserForm((p) => ({ ...p, programme: e.target.value }))}
                      >
                        <option value="">Select Programme</option>
                        {programmesForDept.map((p) => (
                          <option key={p._id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  <button className="btn" onClick={createUser}>
                    Save User
                  </button>

                  {!needsDeptProg(userForm.role) && (
                    <div className="muted tiny" style={{ marginTop: 10 }}>
                      Staff roles do not require Department/Programme.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* List */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>List ({list.length})</h3>
                <button className="btn ghost" onClick={loadList}>
                  Refresh
                </button>
              </div>

              {list.length === 0 && <div className="muted">No data</div>}

              {list.map((x) => (
                <div
                  key={x._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,.08)"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      {x.name || x.roomNumber || x.email}
                    </div>
                    <div className="muted tiny">ID: {x._id}</div>
                  </div>

                  <button className="btn danger" onClick={() => del(x._id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="muted tiny" style={{ marginTop: 10 }}>
              Note: Create Department → Programme → Block → Room. For Staff, Department/Programme not needed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}