import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (ex) {
      setErr(ex.response?.data?.message || "Invalid credentials — please try again.");
    } finally { setBusy(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">C</div>
          <div>
            <div style={{ fontWeight:700, fontSize:"1.1rem" }}>CRM<span style={{ color:"var(--accent)" }}>Pro</span></div>
            <div style={{ fontSize:".75rem", color:"var(--muted)" }}>Lead Management System</div>
          </div>
        </div>
        <h1 className="login-h">Welcome back</h1>
        <p className="login-sub">Sign in to your admin account</p>

        {err && <div className="login-err">{err}</div>}

        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Email address</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required placeholder="admin@crm.com" autoComplete="email" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required placeholder="••••••••" autoComplete="current-password" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:"100%", justifyContent:"center", marginTop:"4px" }} disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>

        <div className="login-hint">
          Demo account — use the admin account created by <code>node seed.js</code> (see README).<br/>
          <small>(run <code>npm run seed</code> in backend first)</small>
        </div>
      </div>
    </div>
  );
}
