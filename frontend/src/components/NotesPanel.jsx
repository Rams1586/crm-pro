import { useState, useEffect, useCallback } from "react";
import { FiBookmark, FiTrash2, FiSend } from "react-icons/fi";
import api from "../api/client";
import { useToast } from "../context/ToastContext";

const TYPES = [
  { id:"note",      label:"📝 Note",       color:"#6366F1" },
  { id:"call",      label:"📞 Call",       color:"#10B981" },
  { id:"email",     label:"📧 Email",      color:"#3B82F6" },
  { id:"meeting",   label:"🤝 Meeting",    color:"#8B5CF6" },
  { id:"follow_up", label:"⏰ Follow-up",  color:"#F59E0B" },
];

const typeColor = (t) => TYPES.find((x) => x.id === t)?.color || "#6366F1";

export default function NotesPanel({ leadId }) {
  const toast = useToast();
  const [notes, setNotes]     = useState([]);
  const [text, setText]       = useState("");
  const [type, setType]       = useState("note");
  const [followUp, setFollowUp] = useState("");
  const [busy, setBusy]       = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/leads/${leadId}/notes`);
      setNotes(data.data);
    } catch { /* silently ignore */ }
    finally { setLoading(false); }
  }, [leadId]);

  useEffect(() => { load(); }, [load]);

  const addNote = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await api.post(`/api/leads/${leadId}/notes`, { content: text.trim(), type, nextFollowUpAt: followUp || undefined });
      setText(""); setFollowUp("");
      await load();
      toast("Note added", "ok");
    } catch { toast("Failed to add note", "err"); }
    finally { setBusy(false); }
  };

  const togglePin = async (note) => {
    try {
      await api.patch(`/api/leads/${leadId}/notes/${note._id}`, { pinned: !note.pinned });
      await load();
    } catch { toast("Failed to update note", "err"); }
  };

  const deleteNote = async (id) => {
    if (!confirm("Delete this note?")) return;
    try {
      await api.delete(`/api/leads/${leadId}/notes/${id}`);
      setNotes((n) => n.filter((x) => x._id !== id));
      toast("Note deleted", "ok");
    } catch { toast("Failed to delete", "err"); }
  };

  const pinned = notes.filter((n) => n.pinned);
  const rest   = notes.filter((n) => !n.pinned);
  const sorted = [...pinned, ...rest];

  return (
    <div className="notes-panel">
      {/* Add note */}
      <div className="note-add">
        <div className="type-tabs">
          {TYPES.map((t) => (
            <button key={t.id} className={`type-tab${type === t.id ? " sel" : ""}`} onClick={() => setType(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <textarea
          className="note-ta"
          placeholder={`Add a ${type.replace("_", " ")}…`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) addNote(); }}
        />
        <div className="note-add-foot">
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
            <label style={{ fontSize:".78rem", color:"var(--muted)", fontWeight:600 }}>Follow-up date</label>
            <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={addNote} disabled={busy || !text.trim()}>
            <FiSend /> {busy ? "Saving…" : "Add"}
          </button>
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="spinner" />
      ) : sorted.length === 0 ? (
        <div className="empty"><p>No notes yet. Add the first one above.</p></div>
      ) : (
        sorted.map((n) => (
          <div key={n._id} className={`note-item${n.pinned ? " pinned" : ""}`}>
            <div className="note-meta">
              <span className="note-dot" style={{ background: typeColor(n.type) }} />
              <strong style={{ color: typeColor(n.type) }}>{n.type.replace("_", " ")}</strong>
              <span>·</span>
              <span>{n.author}</span>
              <span>·</span>
              <span>{new Date(n.createdAt).toLocaleString("en-IN", { dateStyle:"medium", timeStyle:"short" })}</span>
              <div className="note-acts" style={{ marginLeft:"auto" }}>
                <button className={`pin-btn${n.pinned ? " on" : ""}`} onClick={() => togglePin(n)} title={n.pinned ? "Unpin" : "Pin"}>
                  <FiBookmark />
                </button>
                <button className="pin-btn" style={{ color:"var(--lost)" }} onClick={() => deleteNote(n._id)} title="Delete">
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <p className="note-text">{n.content}</p>
          </div>
        ))
      )}
    </div>
  );
}
