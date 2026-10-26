import { useEffect, useMemo, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

export default function ComplaintsRaise() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = String(user?.role || "").toLowerCase() === "superadmin";

  // master data
  const [deps, setDeps] = useState([]);
  const [allProgs, setAllProgs] = useState([]);
  const [allBlocks, setAllBlocks] = useState([]);
  const [allRooms, setAllRooms] = useState([]);

  // form
  const [form, setForm] = useState({
    department: user?.department?._id || user?.department || "",
    programme: user?.programme?._id || user?.programme || "",
    block: "",
    room: "",
    complaintType: "PC Hardware",
    remarks: ""
  });

  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((p) => ({
    ...p,
    [k]: v,
    ...(k === "department" ? { programme: "", block: "", room: "" } : {}),
    ...(k === "programme" ? { block: "", room: "" } : {}),
    ...(k === "block" ? { room: "" } : {})
  }));

  // ----------- LOAD ALL MASTERS ONCE -----------
  useEffect(() => {
    (async () => {
      try {
        setErr("");

        const d = await API.get("/masters/department");
        setDeps(d.data || []);

        const p = await API.get("/masters/programme");
        setAllProgs(p.data || []);

        const b = await API.get("/masters/block");
        setAllBlocks(b.data || []);

        const r = await API.get("/masters/room");
        setAllRooms(r.data || []);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load masters");
      }
    })();
  }, []);

  // ----------- FILTER DROPDOWNS IN FRONTEND -----------
  const progs = useMemo(() => {
    if (!form.department) return [];
    return allProgs.filter((p) => String(p.department) === String(form.department));
  }, [allProgs, form.department]);

  const blocks = useMemo(() => {
    if (!form.department || !form.programme) return [];
    return allBlocks.filter(
      (b) =>
        String(b.department) === String(form.department) &&
        String(b.programme) === String(form.programme)
    );
  }, [allBlocks, form.department, form.programme]);

  const rooms = useMemo(() => {
    if (!form.department || !form.programme || !form.block) return [];
    return allRooms.filter(
      (r) =>
        String(r.department) === String(form.department) &&
        String(r.programme) === String(form.programme) &&
        String(r.block) === String(form.block)
    );
  }, [allRooms, form.department, form.programme, form.block]);

  // ----------- SUBMIT -----------
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    // validations
    if (!form.department) return setErr("Select Department");
    if (!form.programme) return setErr("Select Programme");
    if (!form.block) return setErr("Select Block");
    if (!form.room) return setErr("Select Room");
    if (!form.remarks.trim()) return setErr("Enter Remarks");

    try {
      const fd = new FormData();

      // backend normally expects: department, programme, block, room, complaintType, remarks
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("attachment", file);

      await API.post("/complaints", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMsg("✅ Complaint raised successfully");
      setTimeout(() => setMsg(""), 1500);

      setForm((p) => ({
        ...p,
        block: "",
        room: "",
        complaintType: "PC Hardware",
        remarks: ""
      }));
      setFile(null);
    } catch (e2) {
      setErr(e2.response?.data?.message || "Failed to raise complaint");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Raise Complaint</h1>

        {err && <div className="alert">{err}</div>}
        {msg && <div className="success">{msg}</div>}

        <form className="card form" onSubmit={submit}>
          <label>Department</label>
          <select value={form.department} onChange={(e) => set("department", e.target.value)} required disabled={!isAdmin}>
            <option value="">Select</option>
            {deps.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          <label>Programme</label>
          <select
            value={form.programme}
            onChange={(e) => set("programme", e.target.value)}
            required
            disabled={!form.department || !isAdmin}
          >
            <option value="">Select</option>
            {progs.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <label>Block</label>
          <select
            value={form.block}
            onChange={(e) => set("block", e.target.value)}
            required
            disabled={!form.programme}
          >
            <option value="">Select</option>
            {blocks.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>

          <label>Room</label>
          <select
            value={form.room}
            onChange={(e) => set("room", e.target.value)}
            required
            disabled={!form.block}
          >
            <option value="">Select</option>
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                {r.roomNumber}
              </option>
            ))}
          </select>

          <label>Complaint Type</label>
          <select value={form.complaintType} onChange={(e) => set("complaintType", e.target.value)}>
            {["PC Hardware", "PC Software", "Application Issues", "Network", "Electronics", "Plumbing"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label>Remarks</label>
          <textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} rows={4} required />

          <label>Attachment (optional)</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

          <button className="btn">Submit Complaint</button>
        </form>
      </div>
    </div>
  );
}