import { useEffect, useState } from "react";
import API, { API_BASE_URL } from "../api";
import Navbar from "../components/Navbar";

const isStaffRole = (role) => {
  const r = String(role || "").toLowerCase();
  return r.includes("staff") || ["plumber", "electrician", "software developer"].includes(r);
};
const mediaBase = API_BASE_URL.replace(/\/api\/?$/, "");

export default function ComplaintsList() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [list, setList] = useState([]);
  const [staff, setStaff] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const res = await API.get("/complaints");
      setList(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed");
    }
  };

  const loadStaff = async () => {
    try {
      if (String(user?.role || "").toLowerCase() !== "superadmin") return;
      const users = await API.get("/masters/user");
      setStaff((users.data || []).filter((u) => isStaffRole(u.role)));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    load();
    loadStaff();
    // eslint-disable-next-line
  }, []);

  const assign = async (id, assigneeId) => {
    try {
      if (!assigneeId) return;
      await API.put(`/complaints/${id}/assign`, { assigneeId });
      await load();
    } catch (e) {
      alert(e.response?.data?.message || "Assign failed");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      if (!status) return;
      await API.put(`/complaints/${id}/status`, { status });
      await load();
    } catch (e) {
      alert(e.response?.data?.message || "Update failed");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Complaints</h1>
        {err && <div className="alert">{err}</div>}

        <div className="card">
          <div className="table">
            <div className="thead">
              <div>Type</div>
              <div>Status</div>
              <div>Room</div>
              <div>Raised By</div>
              <div>Assignee</div>
              <div>Raised Date</div>
              <div>Completed Date</div>
              <div>Action</div>
            </div>

            {list.map((c) => {
              const assignedToMe =
                String(c.assignee?._id || "") === String(user?._id || "");

              const formatDate = (dateStr) => {
                if (!dateStr) return "-";
                const d = new Date(dateStr);
                return d.toLocaleDateString();
              };

              let completedDate = "-";
              if (c.status === "Completed") {
                 const completedHist = c.history?.slice().reverse().find(h => h.status === "Completed");
                 if (completedHist) {
                    completedDate = formatDate(completedHist.at);
                 } else {
                    completedDate = formatDate(c.updatedAt);
                 }
              }

              return (
                <div className="trow" key={c._id}>
                  <div>{c.complaintType}</div>
                  <div>
                    <span className="pill">{c.status}</span>
                  </div>
                  <div>
                    {c.block?.name} / {c.room?.roomNumber}
                  </div>
                  <div>{c.raisedBy?.name}</div>
                  <div>{c.assignee?.name || "-"}</div>
                  <div>{formatDate(c.createdAt)}</div>
                  <div>{completedDate}</div>

                  <div className="actions">
                    {c.attachmentUrl && (
                      <a
                        className="link"
                        href={`${mediaBase}${c.attachmentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Attachment
                      </a>
                    )}

                    {/* ✅ Superadmin assign */}
                    {String(user?.role || "").toLowerCase() === "superadmin" && (
                      <select defaultValue="" onChange={(e) => assign(c._id, e.target.value)}>
                        <option value="">Assign</option>
                        {staff.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.role})
                          </option>
                        ))}
                      </select>
                    )}

                    {/* ✅ Staff can update only if assigned */}
                    {isStaffRole(user?.role) && assignedToMe && (
                      <select defaultValue="" onChange={(e) => updateStatus(c._id, e.target.value)}>
                        <option value="">Set Status</option>
                        {["In-Progress", "Onhold", "Completed"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}