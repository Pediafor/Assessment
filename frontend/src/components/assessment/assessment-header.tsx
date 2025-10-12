"use client";
import { useEffect, useRef, useState } from "react";

export function AssessmentHeader({ title, timeSec, onElapsed }: { title: string; timeSec?: number; onElapsed?: () => void }) {
  const [remaining, setRemaining] = useState(timeSec ?? 0);
  const firedRef = useRef(false);
  useEffect(() => {
    if (!timeSec) return;
    // reset timer when timeSec changes
    setRemaining(timeSec);
    firedRef.current = false;
    const id = setInterval(() =>
      setRemaining((s) => {
        const next = s > 0 ? s - 1 : 0;
        return next;
      }),
    1000);
    return () => clearInterval(id);
  }, [timeSec]);
  useEffect(() => {
    if (!timeSec) return;
    if (remaining === 0 && !firedRef.current) {
      firedRef.current = true;
      onElapsed?.();
    }
  }, [remaining, timeSec, onElapsed]);
  const mm = Math.floor(remaining / 60).toString().padStart(2, "0");
  const ss = Math.floor(remaining % 60).toString().padStart(2, "0");
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      {timeSec ? (
        <div className={`font-mono text-sm rounded-md px-2 py-1 border ${remaining <= 60 ? "text-rose-600" : "text-muted"}`}>
          {mm}:{ss}
        </div>
      ) : null}
    </div>
  );
}
