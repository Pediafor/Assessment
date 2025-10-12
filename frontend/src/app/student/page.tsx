import React from "react";
export default function StudentHome() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-2">Assigned</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-md border p-4">
              <div className="font-medium">Assessment #{i}</div>
              <div className="text-sm text-muted">Due in 2 days</div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Draft / In Progress</h2>
        <div className="rounded-md border p-4 text-sm text-muted">No drafts right now</div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Completed</h2>
        <div className="rounded-md border p-4 text-sm text-muted">Your recent results will appear here</div>
      </section>
    </div>
  );
}
