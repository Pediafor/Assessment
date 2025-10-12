export default function StudentResults() {
  const rows = [
    { id: "ENG-101", title: "English Vocabulary Quiz", score: 85, status: "Passed", date: "2025-10-05" },
    { id: "SCI-110", title: "Physics Basics", score: 72, status: "Passed", date: "2025-10-01" },
    { id: "HIS-201", title: "World History", score: 58, status: "Needs Review", date: "2025-09-25" },
    { id: "CHE-120", title: "Chemistry Lab Safety", score: 49, status: "Failed", date: "2025-09-20" },
  ];
  const badge = (status: string) => {
    const cls =
      status === "Passed"
        ? "bg-green-100 text-green-700"
        : status === "Failed"
        ? "bg-rose-100 text-rose-700"
        : "bg-amber-100 text-amber-700";
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>{status}</span>;
  };
  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-card text-muted">
          <tr>
            <th className="text-left p-3 font-medium">Code</th>
            <th className="text-left p-3 font-medium">Title</th>
            <th className="text-left p-3 font-medium">Score</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3 font-medium">{r.id}</td>
              <td className="p-3">{r.title}</td>
              <td className="p-3">{r.score}%</td>
              <td className="p-3">{badge(r.status)}</td>
              <td className="p-3">{r.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
