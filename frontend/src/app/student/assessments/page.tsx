import Link from "next/link";
export default function StudentAssessments() {
  const data = [
    { id: "SAMPLE-001", title: "Sample Assessment (All Types)", due: "2025-10-20", status: "Assigned" },
    { id: "SAMPLE-SECTIONED-001", title: "Section-Timed Sample", due: "2025-10-22", status: "Assigned" },
    { id: "MTH-201", title: "Algebra Midterm", due: "2025-10-25", status: "In Progress" },
    { id: "SCI-110", title: "Physics Basics", due: "2025-10-10", status: "Completed" },
    { id: "HIS-201", title: "World History Essay", due: "2025-10-05", status: "Late" },
    { id: "ART-090", title: "Art Appreciation", due: "2025-11-01", status: "Draft" },
  ];
  const badge = (status: string) => {
    const map: Record<string, string> = {
      "Assigned": "bg-blue-100 text-blue-700",
      "In Progress": "bg-amber-100 text-amber-700",
      "Completed": "bg-green-100 text-green-700",
      "Late": "bg-rose-100 text-rose-700",
      "Draft": "bg-gray-100 text-gray-700",
    };
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${map[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
  };
  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-card text-muted">
            <tr>
              <th className="text-left p-3 font-medium">Code</th>
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium">Due</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3 font-medium">{row.id}</td>
                <td className="p-3">{row.title}</td>
                <td className="p-3">{row.due}</td>
                  <td className="p-3">{badge(row.status)}</td>
                  <td className="p-3 text-right">
                    {row.status === "Completed" ? (
                      <button className="rounded-md border px-3 py-1.5 text-xs" disabled>
                        View
                      </button>
                    ) : (
                      <Link className="rounded-md border px-3 py-1.5 text-xs inline-block hover:bg-card" href={`/student/assessment/${row.id}`}>
                        {row.status === "In Progress" ? "Resume" : "Start"}
                      </Link>
                    )}
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted">Tip: Click an assessment in your dashboard to resume where you left off.</p>
    </div>
  );
}
