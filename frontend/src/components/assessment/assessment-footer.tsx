"use client";
import React, { useState } from "react";

export function AssessmentFooter({ onReview, onSubmit, disabled, submitting }: { onReview: () => void; onSubmit: () => void; disabled?: boolean; submitting?: boolean }) {
  const [confirm, setConfirm] = useState(false);
  const isDisabled = !!disabled || !!submitting;
  return (
    <div className="flex items-center justify-between mt-6">
      <button className="rounded-md border px-3 py-2 text-sm" onClick={onReview} disabled={isDisabled}>Review Answers</button>
      <div className="flex items-center gap-3">
        {confirm ? (
          <>
            <span className="text-xs text-muted">{submitting ? 'Submitting…' : 'Submit now?'}</span>
            <button
              className="rounded-md bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black disabled:opacity-60"
              onClick={onSubmit}
              disabled={isDisabled}
            >
              {submitting ? 'Submitting…' : 'Confirm Submit'}
            </button>
            <button className="rounded-md border px-3 py-2 text-sm" onClick={() => setConfirm(false)} disabled={isDisabled}>Cancel</button>
          </>
        ) : (
          <button
            className="rounded-md bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black disabled:opacity-60"
            onClick={() => setConfirm(true)}
            disabled={isDisabled}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
