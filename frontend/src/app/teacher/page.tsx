export default function TeacherHome() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-2">My Assessments</h2>
        <div className="rounded-md border p-4 text-sm text-muted">Create, edit or assign assessments from the Assessments tab.</div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Grading Queue</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2].map((i) => (
            <div key={i} className="rounded-md border p-4">
              <div className="font-medium">Submission {i}</div>
              <div className="text-sm text-muted">Needs manual review</div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Class Analytics</h2>
        <div className="rounded-md border p-4 text-sm text-muted">Analytics coming soon</div>
      </section>
    </div>
  );
}
