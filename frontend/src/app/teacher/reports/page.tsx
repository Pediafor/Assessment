export default function TeacherReports() {
  const kpis = [
    { label: "Avg. Score", value: "78%" },
    { label: "Completed", value: "124" },
    { label: "Pending Grading", value: "9" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-md border p-4">
            <div className="text-sm text-muted">{k.label}</div>
            <div className="text-2xl font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-md border p-6 text-sm text-muted">
        Charts coming soon
      </div>
    </div>
  );
}
