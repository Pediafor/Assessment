"use client";
import React, { useState } from "react";

export function AssessmentFooter({ onReview, onSubmit }: { onReview: () => void; onSubmit: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="flex items-center justify-between mt-6">
      <button className="rounded-md border px-3 py-2 text-sm" onClick={onReview}>Review Answers</button>
      <div className="flex items-center gap-3">
        {confirm ? (
          <>
            <span className="text-xs text-muted">Submit now?</span>
            <button className="rounded-md bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black" onClick={onSubmit}>Confirm Submit</button>
            <button className="rounded-md border px-3 py-2 text-sm" onClick={() => setConfirm(false)}>Cancel</button>
          </>
        ) : (
          <button className="rounded-md bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black" onClick={() => setConfirm(true)}>Submit</button>
        )}
      </div>
    </div>
  );
}
