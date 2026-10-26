import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/complaints/dashboard");
        setStats(res.data);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load dashboard");
      }
    })();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Dashboard</h1>
        {err && <div className="alert">{err}</div>}

        <div className="grid4">
          <StatCard title="Total Complaints" value={stats.total} />
          <StatCard title="Pending" value={stats.pending} />
          {String(JSON.parse(localStorage.getItem("user") || "null")?.role || "").toLowerCase() === "superadmin" && (
            <StatCard title="Assigned" value={stats.assigned} />
          )}
          <StatCard title="Closed" value={stats.closed} />
        </div>

        <div className="card">
          <div className="muted">
            Tip: Go to “Complaints” to view list, and SuperAdmin can assign staff.
          </div>
        </div>
      </div>
    </div>
  );
}
