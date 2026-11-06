import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";
import LeadModal from "../components/LeadModal";
import { useToast } from "../context/ToastContext";

export default function Leads({ onCountChange }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast    = useToast();

  const [leads,   setLeads]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);

  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState(params.get("status") || "");
  const [source,   setSource]   = useState("");
  const [priority, setPriority] = useState("");
  const [sort,     setSort]     = useState("-createdAt");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search)   q.set("search",   search);
      if (status)   q.set("status",   status);
      if (source)   q.set("source",   source);
      if (priority) q.set("priority", priority);
      q.set("sort", sort);
      const { data } = await api.get(`/api/leads?${q}`);
      setLeads(data.data);
      setTotal(data.total);
      if (onCountChange) onCountChange(data.total);
    } catch { toast("Failed to load leads", "err"); }
    finally { setLoading(false); }
  }, [search, status, source, priority, sort]);

  useEffect(() => { load(); }, [load]);

  const deleteLead = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this lead and all its notes?")) return;
    try {
      await api.delete(`/api/leads/${id}`);
      toast("Lead deleted", "ok");
      load();
    } catch { toast("Delete failed", "err"); }
  };

  const openEdit = (e, lead) => {
    e.stopPropagation();
    setEditing(lead);
    setModal(true);
  };

  return (
    <div className="page">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontSize:"1.3rem", fontWeight:700, marginBottom:2 }}>Leads</h2>
          <p style={{ color:"var(--muted)", fontSize:".85rem" }}>{total} total records</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
          <FiPlus /> Add Lead
        </button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <FiSearch />
          <input className="search-inp" placeholder="Search name, email, company…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="flt-sel" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
        <select className="flt-sel" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All Sources</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="social_media">Social Media</option>
          <option value="cold_outreach">Cold Outreach</option>
          <option value="event">Event</option>
          <option value="other">Other</option>
        </select>
        <select className="flt-sel" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="flt-sel" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="-value">Highest value</option>
          <option value="name">Name A–Z</option>
        </select>
        {(status || source || priority || search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setStatus(""); setSource(""); setPriority(""); }}>
            Clear filters
          </button>
        )}
      </div>

      <div className="card">
        <div className="tbl-wrap">
          {loading ? (
            <div className="spinner" style={{ margin:"40px auto" }} />
          ) : leads.length === 0 ? (
            <div className="empty">
              <FiSearch />
              <p>No leads found. Try adjusting your filters or add a new lead.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Company</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Value</th>
                  <th>Added</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l._id} onClick={() => navigate(`/leads/${l._id}`)}>
                    <td>
                      <div className="td-name">{l.name}</div>
                      <div className="td-sub">{l.email}</div>
                      {l.phone && <div className="td-sub">{l.phone}</div>}
                    </td>
                    <td className="td-mono">{l.company || "—"}</td>
                    <td className="td-mono" style={{ textTransform:"capitalize" }}>{l.source?.replace("_"," ") || "—"}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td><StatusBadge priority={l.priority} /></td>
                    <td className="td-mono">{l.value ? `₹${l.value.toLocaleString("en-IN")}` : "—"}</td>
                    <td className="td-mono">{new Date(l.createdAt).toLocaleDateString("en-IN")}</td>
                    <td>
                      <div className="td-acts">
                        <button className="btn btn-icon btn-ghost btn-sm" title="View" onClick={(e) => { e.stopPropagation(); navigate(`/leads/${l._id}`); }}>
                          <FiEye />
                        </button>
                        <button className="btn btn-icon btn-ghost btn-sm" title="Edit" onClick={(e) => openEdit(e, l)}>
                          <FiEdit2 />
                        </button>
                        <button className="btn btn-icon btn-danger btn-sm" title="Delete" onClick={(e) => deleteLead(e, l._id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <LeadModal lead={editing} onClose={() => setModal(false)} onSaved={load} />
      )}
    </div>
  );
}
