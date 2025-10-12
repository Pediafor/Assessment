export default function SubmittedPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-md border p-6">
      <h1 className="text-xl font-semibold mb-2">Submission received</h1>
      <p className="text-sm text-muted mb-4">
        Your assessment has been submitted successfully. You can review your results once grading is complete.
      </p>
      <div className="flex items-center gap-3">
        <a href="/student/results" className="rounded-md bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black">Go to Results</a>
        <a href="/student" className="rounded-md border px-3 py-2 text-sm">Back to Dashboard</a>
      </div>
    </div>
  );
}
