import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function BootstrapSuperAdmin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    try {
      const res = await API.post("/auth/bootstrap-superadmin", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setOk("Superadmin created. Redirecting...");
      setTimeout(() => nav("/dashboard"), 700);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="authWrap">
      <div className="authCard">
        <h2>Create SuperAdmin (One time only)</h2>
        <p className="muted">If superadmin already exists, go back and login.</p>
        {err && <div className="alert">{err}</div>}
        {ok && <div className="success">{ok}</div>}

        <form onSubmit={submit} className="form">
          <label>Name</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} />

          <label>Phone</label>
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} />

          <label>Email</label>
          <input value={form.email} onChange={(e) => set("email", e.target.value)} />

          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />

          <button className="btn">Create SuperAdmin</button>
        </form>
      </div>
    </div>
  );
}
