import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      nav("/dashboard");
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authWrap">
      <div className="authCard">
        <div className="authHeader">
          <div className="logoMark">🎫</div>
          <div>
            <h2>Ticket Management System</h2>
            <p className="muted">Login using your email & password</p>
          </div>
        </div>

        {err && <div className="alert">{err}</div>}

        <form onSubmit={onLogin} className="form">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

          <button className="btn" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>

        <div className="muted tiny">
          First time? <Link to="/bootstrap">Create SuperAdmin</Link>
        </div>
      </div>
    </div>
  );
}
