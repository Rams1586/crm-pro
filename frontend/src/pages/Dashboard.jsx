import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiUserCheck, FiUserPlus, FiTrendingUp, FiAlertCircle, FiPhone, FiDollarSign } from "react-icons/fi";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";

const STAT_CONFIG = [
  { key:"total",     label:"Total Leads",  cls:"st-total",     Icon:FiUsers        },
  { key:"new",       label:"New",          cls:"st-new",        Icon:FiUserPlus     },
  { key:"contacted", label:"Contacted",    cls:"st-contacted",  Icon:FiPhone        },
  { key:"qualified", label:"Qualified",    cls:"st-qualified",  Icon:FiTrendingUp   },
  { key:"converted", label:"Converted",    cls:"st-converted",  Icon:FiUserCheck    },
  { key:"lost",      label:"Lost",         cls:"st-lost",       Icon:FiAlertCircle  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/leads/stats")
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading dashboard…</span></div>;

  const getCount = (key) => key === "total" ? (stats?.total || 0) : (stats?.byStatus?.[key] || 0);

  return (
    <div className="page">
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:"1.3rem", fontWeight:700, marginBottom:4 }}>Dashboard</h2>
        <p style={{ color:"var(--muted)", fontSize:".87rem" }}>Overview of your lead pipeline</p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {STAT_CONFIG.map(({ key, label, cls, Icon }) => (
          <div key={key} className={`stat-card ${cls}`} style={{ cursor:"pointer" }}
            onClick={() => key !== "total" && navigate(`/leads?status=${key}`)}>
            <div className="stat-icon" style={{ background:"var(--surface-3)" }}>
              <Icon style={{ color:"var(--muted)" }} />
            </div>
            <div className="stat-val">{getCount(key)}</div>
            <div className="stat-lbl">{label}</div>
          </div>
        ))}
        <div className="stat-card st-converted" style={{ cursor:"default" }}>
          <div className="stat-icon" style={{ background:"var(--surface-3)" }}>
            <FiDollarSign style={{ color:"var(--muted)" }} />
          </div>
          <div className="stat-val" style={{ fontSize:"1.4rem" }}>
            ₹{((stats?.totalValue || 0) / 1000).toFixed(0)}K
          </div>
          <div className="stat-lbl">Pipeline Value</div>
        </div>
      </div>

      {/* Recent leads */}
      <div className="card">
        <div className="card-hd">
          <h3>Recent Leads</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/leads")}>View all →</button>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Source</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentLeads || []).length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign:"center", color:"var(--muted)", padding:"30px" }}>No leads yet</td></tr>
              ) : (
                stats.recentLeads.map((l) => (
                  <tr key={l._id} onClick={() => navigate(`/leads/${l._id}`)}>
                    <td>
                      <div className="td-name">{l.name}</div>
                      <div className="td-sub">{l.email}</div>
                    </td>
                    <td className="td-mono">{l.company || "—"}</td>
                    <td className="td-mono">{l.source?.replace("_"," ") || "—"}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td><StatusBadge priority={l.priority} /></td>
                    <td className="td-mono">{new Date(l.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source breakdown */}
      {stats?.bySource?.length > 0 && (
        <div className="card" style={{ marginTop:20 }}>
          <div className="card-hd"><h3>Leads by Source</h3></div>
          <div className="card-body">
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              {stats.bySource.map((s) => (
                <div key={s._id} style={{ background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"var(--r)", padding:"12px 18px", textAlign:"center" }}>
                  <div style={{ fontFamily:"var(--mono)", fontSize:"1.4rem", fontWeight:700 }}>{s.count}</div>
                  <div style={{ fontSize:".78rem", color:"var(--muted)", marginTop:3 }}>{s._id?.replace("_"," ") || "other"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
