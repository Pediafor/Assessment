"use client";
import Link from "next/link";
import { useAssessmentsQuery } from "@/hooks/useSubmissions";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AssessmentListItem } from "@/lib/services/assessments";
const SUBJECT_OPTIONS = (process.env.NEXT_PUBLIC_SUBJECTS || 'Math,Science,English,History,Computer Science')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

export default function StudentAssessments() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [status, setStatus] = useState<string>(params.get('status') || 'PUBLISHED');
  const [subject, setSubject] = useState<string>(params.get('subject') || '');
  const [search, setSearch] = useState<string>(params.get('q') || '');

  // Debounce search input
  const debouncedSearch = useMemo(() => {
    let t: any;
    return (value: string, cb: (v: string) => void) => {
      clearTimeout(t);
      t = setTimeout(() => cb(value), 300);
    };
  }, []);

  const [effectiveSearch, setEffectiveSearch] = useState<string>(search);
  useEffect(() => {
    setEffectiveSearch(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    debouncedSearch(search, setEffectiveSearch);
  }, [search, debouncedSearch]);

  // Sync URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (status) next.set('status', status);
    if (subject) next.set('subject', subject);
    if (effectiveSearch) next.set('q', effectiveSearch);
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}` as any);
  }, [status, subject, effectiveSearch, router, pathname]);

  const { data: fetched, isLoading, isError, error } = useAssessmentsQuery({ status, subject, search: effectiveSearch });
  const data: AssessmentListItem[] = (fetched && fetched.length)
    ? fetched
    : [
        { id: "SAMPLE-001", title: "Sample Assessment (All Types)", due: "2025-10-20", status: "Assigned" },
        { id: "SAMPLE-SECTIONED-001", title: "Section-Timed Sample", due: "2025-10-22", status: "Assigned" },
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
  if (isLoading) return <div>Loading assessments…</div>;
  return (
    <div className="space-y-4" role="main" aria-label="Assessments list">
      <div className="flex flex-wrap items-center gap-3" role="search" aria-label="Filter assessments">
        <div className="flex items-center gap-2">
          <label className="text-sm">Status</label>
          <select
            className="border rounded-md px-2 py-1 text-sm bg-background"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="PUBLISHED">Published</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Subject</label>
          <select
            className="border rounded-md px-2 py-1 text-sm bg-background"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">All</option>
            {SUBJECT_OPTIONS.map((opt) => (
              <option key={opt.toLowerCase()} value={opt.toLowerCase()}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Search</label>
          <input
            className="border rounded-md px-2 py-1 text-sm bg-background"
            placeholder="Title or code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {isError && <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">{(error as any)?.message || 'Failed to load assessments'}</div>}
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
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3 font-medium">{row.id}</td>
                <td className="p-3">{row.title}</td>
                <td className="p-3">{row.due}</td>
                  <td className="p-3">{badge(row.status ?? "")}</td>
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
