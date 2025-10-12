export default function AdminAudit() {
  const logs = [
    { ts: "2025-10-12 09:14", actor: "alice", action: "USER_CREATE", target: "bob@example.com", ip: "10.0.0.13" },
    { ts: "2025-10-12 08:52", actor: "system", action: "JOB_RUN", target: "nightly-backup", ip: "-" },
    { ts: "2025-10-11 17:21", actor: "bob", action: "ROLE_UPDATE", target: "carol@example.com -> teacher", ip: "10.0.0.19" },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Audit Logs</h2>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-zinc-900/40 text-left text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3 font-mono text-xs">{l.ts}</td>
                <td className="px-4 py-3">{l.actor}</td>
                <td className="px-4 py-3"><span className="rounded bg-gray-100 dark:bg-zinc-900/60 px-2 py-0.5 text-xs font-medium">{l.action}</span></td>
                <td className="px-4 py-3">{l.target}</td>
                <td className="px-4 py-3">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
