import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  };

  return (
    <div className="nav">
      <div className="nav-left">
        <div className="brand">TMS</div>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/complaints">Complaints</Link>
        {(user?.role === "User" || user?.role === "Superadmin") && (
          <Link to="/complaints/raise">Raise</Link>
        )}
        {user?.role === "Superadmin" && <Link to="/masters">Masters</Link>}
        {user?.role === "Superadmin" && <Link to="/reports">Reports</Link>}
      </div>

      <div className="nav-right">
        <div className="chip">{user?.name} • {user?.role}</div>
        <button className="btn ghost" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
