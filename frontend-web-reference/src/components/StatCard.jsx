export default function StatCard({ title, value }) {
  return (
    <div className="card stat">
      <div className="muted">{title}</div>
      <div className="statValue">{value}</div>
    </div>
  );
}
