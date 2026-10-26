import { useEffect, useMemo, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

const TYPES = ["PC Hardware", "PC Software", "Application Issues", "Network", "Electronics", "Plumbing"];
const STATUSES = ["Pending", "Assigned", "In-Progress", "Onhold", "Completed"];

export default function Reports() {
  const [deps, setDeps] = useState([]);
  const [progs, setProgs] = useState([]);
  const [users, setUsers] = useState([]);

  const [filters, setFilters] = useState({
    department: "",
    programme: "",
    complaintType: "",
    status: "",
    assignee: ""
  });

  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  // --- LOAD MASTER DATA ---
  useEffect(() => {
    (async () => {
      try {
        const d = await API.get("/masters/department");
        setDeps(d.data || []);
      } catch {}

      try {
        const u = await API.get("/masters/user");
        setUsers(u.data || []);
      } catch {}
    })();
  }, []);

  // Optional programmes endpoint (your backend may not support ?department=)
  useEffect(() => {
    (async () => {
      try {
        if (!filters.department) return setProgs([]);
        const p = await API.get(`/masters/programme?department=${filters.department}`);
        setProgs(p.data || []);
      } catch {
        setProgs([]); // fallback (no crash)
      }
    })();
  }, [filters.department]);

  // --- GENERATE REPORT ---
  const generate = async () => {
    setErr("");
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const res = await API.get("/reports/complaints", { params });

      // handle both formats:
      // 1) { data: [...] }
      // 2) [...]
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setRows(list);
    } catch (e) {
      setErr(e.response?.data?.message || "Report failed");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // --- SUMMARY COUNTS ---
  const summary = useMemo(() => {
    const total = rows.length;
    const by = (s) => rows.filter((r) => String(r.status || "").toLowerCase() === s.toLowerCase()).length;
    return {
      total,
      pending: by("Pending"),
      assigned: by("Assigned"),
      inProgress: by("In-Progress"),
      onhold: by("Onhold"),
      completed: by("Completed")
    };
  }, [rows]);

  // --- ✅ DOWNLOAD SINGLE COMPLAINT PDF (only one row) ---
  const downloadComplaintPDF = (c) => {
    const w = window.open("", "_blank");
    if (!w) {
      alert("Popup blocked. Please allow popups to download PDF.");
      return;
    }

    const safe = (v) => (v === null || v === undefined || v === "" ? "-" : String(v))
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

    const html = `
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Complaint - ${safe(c._id)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 18px; color:#111; }
          h1 { margin:0 0 6px; font-size: 20px; }
          .muted { color:#555; font-size:12px; margin-bottom:14px; }
          .box { border:1px solid #ddd; border-radius:10px; padding:14px; margin-top:12px; }
          .row { display:grid; grid-template-columns: 180px 1fr; gap:10px; padding:8px 0; border-bottom:1px dashed #ddd; }
          .row:last-child { border-bottom:none; }
          .k { color:#444; font-weight:700; font-size:12px; }
          .v { color:#111; font-size:13px; line-height:1.4; }
          .pill { display:inline-block; padding:3px 10px; border-radius:999px; border:1px solid #ddd; font-size:12px; }
          @media print { body { padding:0; } }
        </style>
      </head>
      <body>
        <h1>Complaint Report (Single)</h1>
        <div class="muted">Generated on: ${new Date().toLocaleString()}</div>

        <div class="box">
          <div class="row"><div class="k">Complaint ID</div><div class="v">${safe(c._id)}</div></div>
          <div class="row"><div class="k">Type</div><div class="v">${safe(c.complaintType)}</div></div>
          <div class="row"><div class="k">Status</div><div class="v"><span class="pill">${safe(c.status)}</span></div></div>
          <div class="row"><div class="k">Department</div><div class="v">${safe(c.department?.name)}</div></div>
          <div class="row"><div class="k">Programme</div><div class="v">${safe(c.programme?.name)}</div></div>
          <div class="row"><div class="k">Block / Room</div><div class="v">${safe(c.block?.name)} / ${safe(c.room?.roomNumber)}</div></div>
          <div class="row"><div class="k">Raised By</div><div class="v">${safe(c.raisedBy?.name)} (${safe(c.raisedBy?.email)})</div></div>
          <div class="row"><div class="k">Assignee</div><div class="v">${safe(c.assignee?.name)} (${safe(c.assignee?.role)})</div></div>
          <div class="row"><div class="k">Created At</div><div class="v">${
            c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"
          }</div></div>
          <div class="row"><div class="k">Remarks</div><div class="v">${safe(c.remarks)}</div></div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Complaint Report</h1>
        {err && <div className="alert">{err}</div>}

        {/* FILTERS */}
        <div className="card form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>Department</label>
            <select value={filters.department} onChange={(e) => set("department", e.target.value)}>
              <option value="">All</option>
              {deps.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Programme</label>
            <select value={filters.programme} onChange={(e) => set("programme", e.target.value)}>
              <option value="">All</option>
              {progs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Complaint Type</label>
            <select value={filters.complaintType} onChange={(e) => set("complaintType", e.target.value)}>
              <option value="">All</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Status</label>
            <select value={filters.status} onChange={(e) => set("status", e.target.value)}>
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Assignee</label>
            <select value={filters.assignee} onChange={(e) => set("assignee", e.target.value)}>
              <option value="">All</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10 }}>
            <button className="btn" onClick={generate} disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
          <SummaryBox title="Total" value={summary.total} />
          <SummaryBox title="Pending" value={summary.pending} />
          <SummaryBox title="Assigned" value={summary.assigned} />
          <SummaryBox title="In-Progress" value={summary.inProgress} />
          <SummaryBox title="Onhold" value={summary.onhold} />
          <SummaryBox title="Completed" value={summary.completed} />
        </div>

        {/* TABLE */}
        <div className="card" style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 980 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px 120px 220px 220px 120px 140px 160px 170px 160px",
                gap: 10,
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,.12)",
                fontWeight: 800
              }}
            >
              <div>Type</div>
              <div>Status</div>
              <div>Department</div>
              <div>Programme</div>
              <div>Room</div>
              <div>Raised By</div>
              <div>Assignee</div>
              <div>Date</div>
              <div>PDF</div>
            </div>

            {rows.length === 0 ? (
              <div className="muted" style={{ padding: "12px 0" }}>
                No data
              </div>
            ) : (
              rows.map((c) => (
                <div
                  key={c._id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 120px 220px 220px 120px 140px 160px 170px 160px",
                    gap: 10,
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(255,255,255,.08)",
                    alignItems: "center"
                  }}
                >
                  <div style={{ wordBreak: "break-word" }}>{c.complaintType || "-"}</div>

                  <div>
                    <span className="pill">{c.status || "-"}</span>
                  </div>

                  <div style={{ wordBreak: "break-word" }}>{c.department?.name || "-"}</div>
                  <div style={{ wordBreak: "break-word" }}>{c.programme?.name || "-"}</div>

                  <div>
                    {c.block?.name || "-"} / {c.room?.roomNumber || "-"}
                  </div>

                  <div style={{ wordBreak: "break-word" }}>{c.raisedBy?.name || "-"}</div>
                  <div style={{ wordBreak: "break-word" }}>{c.assignee?.name || "-"}</div>

                  <div>{c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}</div>

                  <div>
                    <button className="btn ghost" onClick={() => downloadComplaintPDF(c)}>
                      Download
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="muted tiny" style={{ marginTop: 10 }}>
            PDF Download prints only that complaint → choose “Save as PDF”.
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryBox({ title, value }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,.10)", borderRadius: 12, padding: 12 }}>
      <div className="muted tiny">{title}</div>
      <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>{value}</div>
    </div>
  );
}