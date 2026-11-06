import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiTrash2 } from "react-icons/fi";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";
import NotesPanel from "../components/NotesPanel";
import LeadModal from "../components/LeadModal";
import { useToast } from "../context/ToastContext";

const STATUSES = ["new","contacted","qualified","converted","lost"];
const pipeIdx  = (s) => STATUSES.indexOf(s);

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast    = useToast();

  const [lead,    setLead]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/api/leads/${id}`);
      setLead(data.data);
    } catch { toast("Could not load lead", "err"); navigate("/leads"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (newStatus) => {
    if (newStatus === lead.status || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const { data } = await api.patch(`/api/leads/${id}/status`, { status: newStatus });
      setLead(data.data);
      toast(`Status → ${newStatus}`, "ok");
    } catch { toast("Status update failed", "err"); }
    finally { setUpdatingStatus(false); }
  };

  const deleteLead = async () => {
    if (!confirm("Delete this lead and all its notes? This cannot be undone.")) return;
    try {
      await api.delete(`/api/leads/${id}`);
      toast("Lead deleted", "ok");
      navigate("/leads");
    } catch { toast("Delete failed", "err"); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading lead…</span></div>;
  if (!lead)   return null;

  const progress = STATUSES.filter((s) => s !== "lost");

  return (
    <div className="page">
      {/* Back + actions */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, marginBottom:6 }}>
        <button className="back-link" onClick={() => navigate("/leads")}>
          <FiArrowLeft /> Back to Leads
        </button>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setModal(true)}><FiEdit2 /> Edit</button>
          <button className="btn btn-danger btn-sm" onClick={deleteLead}><FiTrash2 /> Delete</button>
        </div>
      </div>

      {/* Header */}
      <div style={{ marginBottom:22 }}>
        <h2 style={{ fontSize:"1.4rem", fontWeight:700 }}>{lead.name}</h2>
        <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap", alignItems:"center" }}>
          <StatusBadge status={lead.status} />
          <StatusBadge priority={lead.priority} />
          {lead.company && <span style={{ fontSize:".83rem", color:"var(--muted)" }}>@ {lead.company}</span>}
          {lead.value > 0 && <span style={{ fontFamily:"var(--mono)", fontSize:".83rem", color:"var(--converted)" }}>₹{lead.value.toLocaleString("en-IN")}</span>}
        </div>

        {/* Pipeline progress bar */}
        {lead.status !== "lost" && (
          <div style={{ marginTop:14 }}>
            <div className="pipe">
              {progress.map((s, i) => (
                <div key={s} className={`pipe-seg${i <= pipeIdx(lead.status) ? " done" : ""}`} />
              ))}
            </div>
            <div style={{ fontSize:".73rem", color:"var(--muted)", marginTop:4 }}>
              Stage {pipeIdx(lead.status) + 1} of {progress.length} — {lead.status}
            </div>
          </div>
        )}
      </div>

      <div className="detail-grid">
        {/* Left column */}
        <div>
          {/* Status stepper */}
          <div className="card" style={{ marginBottom:18 }}>
            <div className="card-hd"><h3>Update Status</h3></div>
            <div className="card-body">
              <div className="stepper">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    className={`step-btn${lead.status === s ? ` step-${s}` : ""}`}
                    onClick={() => updateStatus(s)}
                    disabled={updatingStatus}
                    style={{ textTransform:"capitalize" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="card" style={{ marginBottom:18 }}>
            <div className="card-hd"><h3>Contact Information</h3></div>
            <div className="card-body">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
                {[
                  ["Email",      lead.email       ],
                  ["Phone",      lead.phone || "—"],
                  ["Company",    lead.company || "—"],
                  ["Source",     lead.source?.replace("_"," ") || "—"],
                  ["Assigned To",lead.assignedTo || "—"],
                  ["Created",    new Date(lead.createdAt).toLocaleDateString("en-IN",{ dateStyle:"long" })],
                  ["Last Contacted", lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString("en-IN") : "—"],
                  ["Next Follow-up", lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleDateString("en-IN") : "—"],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="detail-field">
                    <label>{lbl}</label>
                    <span className="detail-val">{val}</span>
                  </div>
                ))}
              </div>
              {lead.message && (
                <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid var(--border)" }}>
                  <label style={{ display:"block", fontSize:".73rem", color:"var(--muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>Initial Message</label>
                  <p style={{ fontSize:".88rem", color:"var(--muted)", whiteSpace:"pre-wrap" }}>{lead.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column — Notes */}
        <div>
          <div className="card">
            <div className="card-hd"><h3>Notes & Activity</h3></div>
            <div className="card-body">
              <NotesPanel leadId={id} />
            </div>
          </div>
        </div>
      </div>

      {modal && <LeadModal lead={lead} onClose={() => setModal(false)} onSaved={load} />}
    </div>
  );
}
