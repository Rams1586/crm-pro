import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import api from "../api/client";
import { useToast } from "../context/ToastContext";

const EMPTY = { name:"", email:"", phone:"", company:"", source:"website", status:"new", priority:"medium", value:"", message:"", assignedTo:"" };

export default function LeadModal({ lead, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm]   = useState(EMPTY);
  const [busy, setBusy]   = useState(false);

  useEffect(() => {
    if (lead) setForm({ ...EMPTY, ...lead, value: lead.value ?? "" });
    else      setForm(EMPTY);
  }, [lead]);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, value: parseFloat(form.value) || 0 };
      if (lead?._id) await api.put(`/api/leads/${lead._id}`, payload);
      else           await api.post("/api/leads", payload);
      toast(lead ? "Lead updated" : "Lead created", "ok");
      onSaved();
      onClose();
    } catch (err) {
      toast(err.response?.data?.message || "Save failed", "err");
    } finally { setBusy(false); }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <h2>{lead ? "Edit Lead" : "Add New Lead"}</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input name="name" value={form.name} onChange={set} required placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input name="email" type="email" value={form.email} onChange={set} required placeholder="email@company.com" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={set} placeholder="+91 9876543210" />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input name="company" value={form.company} onChange={set} placeholder="Company name" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Source</label>
                  <select name="source" value={form.source} onChange={set}>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social_media">Social Media</option>
                    <option value="cold_outreach">Cold Outreach</option>
                    <option value="event">Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={set}>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" value={form.priority} onChange={set}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Deal Value (₹)</label>
                  <input name="value" type="number" min="0" value={form.value} onChange={set} placeholder="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Assigned To</label>
                <input name="assignedTo" value={form.assignedTo} onChange={set} placeholder="Team member name" />
              </div>
              <div className="form-group">
                <label>Message / Notes</label>
                <textarea name="message" value={form.message} onChange={set} rows={3} placeholder="Initial enquiry or context…" />
              </div>
            </div>
          </div>
          <div className="modal-ft">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : lead ? "Save changes" : "Add lead"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
