export default function AdminHome() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-2">System Overview</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {["Users", "Tenants", "Services"].map((name) => (
            <div key={name} className="rounded-md border p-4">
              <div className="font-medium">{name}</div>
              <div className="text-sm text-muted">Healthy</div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
        <div className="rounded-md border p-4 text-sm text-muted">Audit events will appear here</div>
      </section>
    </div>
  );
}
