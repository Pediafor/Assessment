"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/role-guard";
import { AssessmentHeader } from "./assessment-header";
import { QuestionNav } from "./question-nav";
import { QuestionRenderer } from "./question-renderer";
import { AssessmentFooter } from "./assessment-footer";
import { sampleAssessment, sectionTimedAssessment } from "./sample";
import type { Assessment } from "./types";
import { getSubmission, saveSubmissionProgress, startSubmission, submitSubmission } from "@/lib/services/assessments";

export function AssessmentPlayer({ id }: { id: string }) {
  const router = useRouter();
  const assessment: Assessment = id === "SAMPLE-SECTIONED-001" ? sectionTimedAssessment : sampleAssessment;
  const hasSections = Array.isArray(assessment.sections) && assessment.sections.length > 0;

  const sections = assessment.sections ?? [];
  const sectionOffsets = useMemo(() => {
    if (!hasSections) return [0];
    const offs: number[] = [0];
    let acc = 0;
    for (const s of sections) {
      acc += s.questions.length;
      offs.push(acc);
    }
    return offs;
  }, [hasSections, sections]);

  const flatQuestions = useMemo(() => (hasSections ? sections.flatMap((s) => s.questions) : assessment.questions || []), [assessment, hasSections, sections]);

  const [index, setIndex] = useState(1);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [flags, setFlags] = useState<Set<number>>(new Set());
  const [lockedSections, setLockedSections] = useState<Set<number>>(new Set());
  const [showReview, setShowReview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = flatQuestions.length;
  const current = useMemo(() => flatQuestions[index - 1], [flatQuestions, index]);
  const answered = useMemo(() => {
    return new Set<number>(
      flatQuestions
        .map((q, i) => (answers[q.id] != null && (Array.isArray(answers[q.id]) ? (answers[q.id] as any[]).length > 0 : true) ? i + 1 : 0))
        .filter(Boolean) as number[]
    );
  }, [answers, flatQuestions]);

  const sectionIndex = useMemo(() => {
    if (!hasSections) return 0;
    for (let i = 0; i < sectionOffsets.length - 1; i++) {
      const start = sectionOffsets[i] + 1;
      const end = sectionOffsets[i + 1];
      if (index >= start && index <= end) return i;
    }
    return sectionOffsets.length - 2;
  }, [hasSections, sectionOffsets, index]);

  const sectionStart = useMemo(() => (hasSections ? sectionOffsets[sectionIndex] + 1 : 1), [hasSections, sectionOffsets, sectionIndex]);
  const sectionEnd = useMemo(() => (hasSections ? sectionOffsets[sectionIndex + 1] : total), [hasSections, sectionOffsets, sectionIndex, total]);

  // Restore draft
  useEffect(() => {
    const key = `draft-${assessment.id}`;
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          if (data.answers) setAnswers(data.answers);
          if (data.index) setIndex(Math.min(Math.max(1, Number(data.index) || 1), total));
          if (Array.isArray(data.flags)) setFlags(new Set<number>(data.flags));
          if (Array.isArray(data.lockedSectionsIndices)) setLockedSections(new Set<number>(data.lockedSectionsIndices));
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment.id, total]);

  // Start or resume server-side submission (best-effort)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await startSubmission(assessment.id);
        if (!cancelled && res?.submissionId) {
          setSubmissionId(res.submissionId);
          // Try hydrating from server if answers exist
          try {
            const sub = await getSubmission(res.submissionId);
            const srvAnswers = sub?.answers;
            const meta = (sub as any)?.metadata;
            if (!cancelled && srvAnswers && typeof srvAnswers === "object") {
              setAnswers(srvAnswers as any);
              if (meta?.index) setIndex(Math.min(Math.max(1, Number(meta.index) || 1), total));
              if (Array.isArray(meta?.flags)) setFlags(new Set<number>(meta.flags));
              if (Array.isArray(meta?.lockedSections)) setLockedSections(new Set<number>(meta.lockedSections));
            }
          } catch {}
        }
      } catch {
        // fallback to local-only mode
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assessment.id]);

  // Autosave draft
  useEffect(() => {
    const key = `draft-${assessment.id}`;
    localStorage.setItem(
      key,
      JSON.stringify({ answers, index, flags: Array.from(flags), lockedSectionsIndices: Array.from(lockedSections) })
    );
  }, [answers, index, flags, lockedSections, assessment.id]);

  // Debounced remote save (best-effort)
  useEffect(() => {
    if (!submissionId) return; // only when server submission exists
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const payload = {
        index,
        answers,
        flags: Array.from(flags),
        lockedSections: Array.from(lockedSections),
      } as const;
      saveSubmissionProgress(submissionId, payload).catch(() => {
        // ignore errors; local draft persists
      });
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [answers, index, flags, lockedSections, submissionId]);

  const onChange = (next: unknown) => setAnswers((s) => ({ ...s, [current.id]: next }));
  const onFlag = (f: boolean) =>
    setFlags((prev) => {
      const copy = new Set(prev);
      const idx = index;
      if (f) copy.add(idx);
      else copy.delete(idx);
      return copy;
    });

  const timeSec = hasSections ? sections[sectionIndex]?.timeLimitSec : assessment.totalTimeSec;
  const isCurrentSectionLocked = hasSections ? lockedSections.has(sectionIndex) : false;

  const saveDraft = () => {
    const key = `draft-${assessment.id}`;
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ answers, index, flags: Array.from(flags), lockedSectionsIndices: Array.from(lockedSections) })
      );
    } catch {}
  };

  const goToSectionStart = (secIdx: number) => {
    const start = (sectionOffsets[secIdx - 1] ?? 0) + 1;
    setIndex(start);
  };

  const handleTimerElapsed = () => {
    if (hasSections) {
      saveDraft();
      if (submissionId) {
        // persist immediately on section boundary
        const payload = {
          index,
          answers,
          flags: Array.from(flags),
          lockedSections: Array.from(lockedSections),
        } as const;
        saveSubmissionProgress(submissionId, payload).catch(() => {});
      }
      setLockedSections((prev) => {
        const next = new Set(prev);
        for (let s = 0; s <= sectionIndex; s++) next.add(s);
        return next;
      });
      const nextSection = sectionIndex + 1;
      if (nextSection < sections.length) {
        goToSectionStart(nextSection);
      } else {
        setSubmitted(true);
        if (submissionId) {
          submitSubmission(submissionId).catch(() => {});
        }
        router.push(`/student/assessment/${assessment.id}/submitted`);
      }
    } else {
      saveDraft();
      setSubmitted(true);
      if (submissionId) {
        submitSubmission(submissionId).catch(() => {});
      }
      router.push(`/student/assessment/${assessment.id}/submitted`);
    }
  };

  // Exit guard
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [submitted]);

  return (
    <RoleGuard allow="student">
      <div className="space-y-4">
        <AssessmentHeader
          title={hasSections ? `${assessment.title} — ${sections[sectionIndex]?.title ?? ""}` : assessment.title}
          timeSec={timeSec}
          onElapsed={handleTimerElapsed}
        />

        {hasSections && (
          <div className="flex items-center gap-2 text-xs text-muted">
            {sections.map((sec, i) => (
              <button
                key={sec.id}
                onClick={() => {
                  if (lockedSections.has(i)) return;
                  if (i > sectionIndex) {
                    setLockedSections((prev) => {
                      const next = new Set(prev);
                      for (let s = 0; s <= sectionIndex; s++) next.add(s);
                      return next;
                    });
                  }
                  const start = (sectionOffsets[i - 1] ?? 0) + 1;
                  setIndex(start);
                }}
                className={
                  "rounded-md border px-2 py-1 " +
                  (i === sectionIndex
                    ? "bg-card font-medium"
                    : lockedSections.has(i)
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-card")
                }
              >
                {sec.title}
                {sec.timeLimitSec ? ` (${Math.floor(sec.timeLimitSec / 60)}m)` : ""}
              </button>
            ))}
          </div>
        )}

        {/* Desktop: left nav, right content */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4">
          <div className="lg:col-span-3">
            <div className="rounded-md border p-3 sticky top-20">
              <div className="mb-2 text-xs text-muted">
                Answered: {answered.size} / {total} · Flagged: {flags.size}
              </div>
              <QuestionNav
                orientation="vertical"
                total={total}
                current={index}
                answered={answered}
                flagged={flags}
                onJump={(i) => {
                  if (!hasSections) return setIndex(i);
                  const targetSection = (() => {
                    for (let s = 0; s < sectionOffsets.length - 1; s++) {
                      const start = sectionOffsets[s] + 1;
                      const end = sectionOffsets[s + 1];
                      if (i >= start && i <= end) return s;
                    }
                    return 0;
                  })();
                  if (lockedSections.has(targetSection)) return;
                  setIndex(i);
                }}
              />
            </div>
          </div>
          <div className="lg:col-span-9">
            <div className="rounded-md border p-4">
              <QuestionRenderer
                q={current as any}
                value={answers[current.id]}
                onChange={onChange}
                onFlag={onFlag}
                flagged={flags.has(index)}
                readOnly={isCurrentSectionLocked}
              />
              <div className="flex items-center justify-between mt-6">
                <button
                  className="rounded-md border px-3 py-2 text-sm"
                  disabled={index <= 1 || isCurrentSectionLocked || (hasSections && index <= sectionStart)}
                  onClick={() => {
                    const nextIdx = Math.max(1, index - 1);
                    if (!hasSections) return setIndex(nextIdx);
                    const targetSection = (() => {
                      for (let s = 0; s < sectionOffsets.length - 1; s++) {
                        const start = sectionOffsets[s] + 1;
                        const end = sectionOffsets[s + 1];
                        if (nextIdx >= start && nextIdx <= end) return s;
                      }
                      return sectionIndex;
                    })();
                    if (lockedSections.has(targetSection)) return;
                    setIndex(nextIdx);
                  }}
                >
                  Previous
                </button>
                <div className="text-xs text-muted">
                  {index} / {total}
                </div>
                <button
                  className="rounded-md border px-3 py-2 text-sm"
                  disabled={index >= total || isCurrentSectionLocked || (hasSections && index >= sectionEnd)}
                  onClick={() => {
                    const nextIdx = Math.min(total, index + 1);
                    if (!hasSections) return setIndex(nextIdx);
                    if (nextIdx > sectionEnd) return;
                    setIndex(nextIdx);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
            {hasSections && sectionIndex < sections.length - 1 && !isCurrentSectionLocked && (
              <div className="flex justify-end">
                <button
                  className="mt-3 rounded-md bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black"
                  onClick={() => {
                    saveDraft();
                    setLockedSections((prev) => {
                      const next = new Set(prev);
                      for (let s = 0; s <= sectionIndex; s++) next.add(s);
                      return next;
                    });
                    goToSectionStart(sectionIndex + 1);
                  }}
                >
                  Next section →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: top nav + content */}
        <div className="lg:hidden">
          <QuestionNav
            total={total}
            current={index}
            answered={answered}
            flagged={flags}
            onJump={(i) => {
              if (!hasSections) return setIndex(i);
              const targetSection = (() => {
                for (let s = 0; s < sectionOffsets.length - 1; s++) {
                  const start = sectionOffsets[s] + 1;
                  const end = sectionOffsets[s + 1];
                  if (i >= start && i <= end) return s;
                }
                return 0;
              })();
              if (lockedSections.has(targetSection)) return;
              setIndex(i);
            }}
          />
            <div className="rounded-md border p-4 mt-4">
            <QuestionRenderer
              q={current as any}
              value={answers[current.id]}
              onChange={onChange}
              onFlag={onFlag}
              flagged={flags.has(index)}
              readOnly={isCurrentSectionLocked}
            />
            <div className="flex items-center justify-between mt-6">
              <button
                className="rounded-md border px-3 py-2 text-sm"
                disabled={index <= 1 || isCurrentSectionLocked || (hasSections && index <= sectionStart)}
                onClick={() => {
                  const nextIdx = Math.max(1, index - 1);
                  if (!hasSections) return setIndex(nextIdx);
                  const targetSection = (() => {
                    for (let s = 0; s < sectionOffsets.length - 1; s++) {
                      const start = sectionOffsets[s] + 1;
                      const end = sectionOffsets[s + 1];
                      if (nextIdx >= start && nextIdx <= end) return s;
                    }
                    return sectionIndex;
                  })();
                  if (lockedSections.has(targetSection)) return;
                  setIndex(nextIdx);
                }}
              >
                Previous
              </button>
              <div className="text-xs text-muted">{index} / {total}</div>
              <button
                className="rounded-md border px-3 py-2 text-sm"
                disabled={index >= total || isCurrentSectionLocked || (hasSections && index >= sectionEnd)}
                onClick={() => {
                  const nextIdx = Math.min(total, index + 1);
                  if (!hasSections) return setIndex(nextIdx);
                  if (nextIdx > sectionEnd) return;
                  setIndex(nextIdx);
                }}
              >
                Next
              </button>
            </div>
            {hasSections && sectionIndex < sections.length - 1 && !isCurrentSectionLocked && (
              <div className="flex justify-end">
                <button
                  className="mt-3 rounded-md bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black"
                  onClick={() => {
                    saveDraft();
                    setLockedSections((prev) => {
                      const next = new Set(prev);
                      for (let s = 0; s <= sectionIndex; s++) next.add(s);
                      return next;
                    });
                    goToSectionStart(sectionIndex + 1);
                  }}
                >
                  Next section →
                </button>
              </div>
            )}
          </div>
        </div>

        <AssessmentFooter
          onReview={() => setShowReview(true)}
          onSubmit={() => {
            setSubmitted(true);
            if (submissionId) {
              submitSubmission(submissionId).catch(() => {});
            }
            router.push(`/student/assessment/${assessment.id}/submitted`);
          }}
        />

        {showReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-3xl rounded-md border bg-background p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Review answers</h2>
                <button className="text-sm text-muted hover:underline" onClick={() => setShowReview(false)}>Close</button>
              </div>
              {hasSections ? (
                <div className="space-y-4 max-h-[60vh] overflow-auto pr-1">
                  {sections.map((sec, sIdx) => {
                    const start = sectionOffsets[sIdx] + 1;
                    const end = sectionOffsets[sIdx + 1];
                    return (
                      <div key={sec.id} className="space-y-2">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <span>{sec.title}</span>
                          <span className="text-xs text-muted">
                            ({Array.from({ length: end - start + 1 }).reduce<number>((acc, _, j) => acc + (answered.has(start + j) ? 1 : 0), 0)}
                            /{end - start + 1} answered · {Array.from({ length: end - start + 1 }).reduce<number>((acc, _, j) => acc + (flags.has(start + j) ? 1 : 0), 0)} flagged)
                          </span>
                          {lockedSections.has(sIdx) && <span className="text-xs text-muted">(locked)</span>}
                        </div>
                        <div className="grid grid-cols-10 gap-2">
                          {Array.from({ length: end - start + 1 }).map((_, i) => {
                            const idx = start + i;
                            const isAnswered = answered.has(idx);
                            const isFlagged = flags.has(idx);
                            return (
                              <button
                                key={idx}
                                disabled={lockedSections.has(sIdx)}
                                onClick={() => {
                                  if (lockedSections.has(sIdx)) return;
                                  setIndex(idx);
                                  setShowReview(false);
                                }}
                                className={
                                  "h-8 rounded-md text-xs font-medium border " +
                                  (idx === index
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : isFlagged
                                    ? "bg-amber-100 text-amber-800"
                                    : isAnswered
                                    ? "bg-green-100 text-green-800"
                                    : "bg-card text-muted")
                                }
                              >
                                {idx}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-10 gap-2 max-h-[60vh] overflow-auto pr-1">
                  {Array.from({ length: total }).map((_, i) => {
                    const idx = i + 1;
                    const isAnswered = answered.has(idx);
                    const isFlagged = flags.has(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setIndex(idx);
                          setShowReview(false);
                        }}
                        className={
                          "h-8 rounded-md text-xs font-medium border " +
                          (idx === index
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : isFlagged
                            ? "bg-amber-100 text-amber-800"
                            : isAnswered
                            ? "bg-green-100 text-green-800"
                            : "bg-card text-muted")
                        }
                      >
                        {idx}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
