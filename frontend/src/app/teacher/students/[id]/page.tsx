"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useStudentDetail, useStudentSubmissions } from "@/hooks/useTeacher";

export default function StudentDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { data: student, isLoading } = useStudentDetail(id);
  const { data: submissions = [], isLoading: subsLoading } = useStudentSubmissions(id, 5);

  if (isLoading) return <div>Loading student…</div>;
  if (!student) return <div>Student not found</div>;

  const name = [student.firstName, student.lastName].filter(Boolean).join(" ") || student.email;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-sm text-muted-foreground">{student.email}</p>
        </div>
        <Link href="/teacher/students" className="text-sm underline">Back to Students</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border p-4">
          <h3 className="font-medium mb-2">Profile</h3>
          <div className="text-sm space-y-1">
            <div><span className="text-muted-foreground">ID:</span> {student.id}</div>
            <div><span className="text-muted-foreground">Role:</span> {student.role}</div>
            <div><span className="text-muted-foreground">Status:</span> {student.isActive ? 'Active' : 'Inactive'}</div>
            <div><span className="text-muted-foreground">Last login:</span> {student.lastLogin ? new Date(student.lastLogin).toLocaleString() : '—'}</div>
            <div><span className="text-muted-foreground">Joined:</span> {student.createdAt ? new Date(student.createdAt).toLocaleString() : '—'}</div>
          </div>
        </div>
        <div className="rounded-md border p-4 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Recent submissions</h3>
            <Link href={("/teacher/students/" + id + "/submissions") as any} className="text-sm underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Assessment</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {subsLoading && (<tr><td className="p-2" colSpan={4}>Loading…</td></tr>)}
                {!subsLoading && submissions.length === 0 && (<tr><td className="p-2" colSpan={4}>No submissions yet</td></tr>)}
                {submissions.map((s: any) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2">{s.assessment?.title || s.assessmentId}</td>
                    <td className="p-2">{s.status}</td>
                    <td className="p-2">{s.score != null ? `${s.score}/${s.maxScore}` : '—'}</td>
                    <td className="p-2">{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h3 className="font-medium mb-2">Quick actions</h3>
        <div className="flex gap-2">
          <button className="border rounded px-3 py-1.5 text-sm">Reset password (stub)</button>
          <button className="border rounded px-3 py-1.5 text-sm">Deactivate</button>
        </div>
      </div>
    </div>
  );
}
