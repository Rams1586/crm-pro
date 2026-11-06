import { NavLink, useNavigate } from "react-router-dom";
import { FiGrid, FiUsers, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ leadCount }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => { logout(); navigate("/login"); };

  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-icon">C</div>
        <span className="sb-logo-text">CRM<span>Pro</span></span>
      </div>

      <nav className="sb-nav">
        <div className="sb-section">Main</div>
        <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <FiGrid /> Dashboard
        </NavLink>
        <NavLink to="/leads" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <FiUsers /> Leads
          {leadCount != null && <span className="nav-badge">{leadCount}</span>}
        </NavLink>
      </nav>

      <div className="sb-bottom">
        <div className="admin-card">
          <div className="admin-av">{admin?.name?.[0]?.toUpperCase() || "A"}</div>
          <div className="admin-info">
            <div className="admin-name">{admin?.name || "Admin"}</div>
            <div className="admin-role">{admin?.role || "admin"}</div>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Logout"><FiLogOut /></button>
        </div>
      </div>
    </aside>
  );
}
