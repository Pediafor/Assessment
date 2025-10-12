export default function AdminReports() {
  const kpis = [
    { label: "Active Users", value: "1,245" },
    { label: "Assessments", value: "312" },
    { label: "Submissions Today", value: "87" },
    { label: "Error Rate", value: "0.4%" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-md border p-4">
            <div className="text-sm text-muted">{k.label}</div>
            <div className="text-2xl font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border p-6 text-sm text-muted">Usage graph placeholder</div>
        <div className="rounded-md border p-6 text-sm text-muted">Performance graph placeholder</div>
      </div>
    </div>
  );
}
