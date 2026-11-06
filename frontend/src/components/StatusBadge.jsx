export default function StatusBadge({ status, priority }) {
  if (priority) return <span className={`badge badge-${priority}`}>{priority}</span>;
  return <span className={`badge badge-${status}`}>{status}</span>;
}
