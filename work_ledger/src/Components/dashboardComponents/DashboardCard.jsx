export default function DashboardCard({ title, value }) {
  return (
    <div className="card card-shadow p-3">
      <h6 className="text-muted">{title}</h6>
      <h2 className="fw-bold">{value}</h2>
    </div>
  );
}
