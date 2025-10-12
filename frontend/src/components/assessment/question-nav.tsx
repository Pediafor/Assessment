"use client";
import React from "react";

export function QuestionNav({
  total,
  current,
  answered,
  flagged,
  onJump,
  orientation = "grid",
}: {
  total: number;
  current: number;
  answered: Set<number>;
  flagged: Set<number>;
  onJump: (index: number) => void;
  orientation?: "grid" | "vertical";
}) {
  const baseClass =
    "rounded-md text-xs font-medium border hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-primary";
  if (orientation === "vertical") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const idx = i + 1;
          const isCurrent = idx === current;
          const isAnswered = answered.has(idx);
          const isFlagged = flagged.has(idx);
          return (
            <button
              key={idx}
              onClick={() => onJump(idx)}
              className={
                baseClass +
                " h-8 px-2 text-left " +
                (isCurrent
                  ? " bg-black text-white dark:bg-white dark:text-black"
                  : isFlagged
                  ? " bg-amber-100 text-amber-800"
                  : isAnswered
                  ? " bg-green-100 text-green-800"
                  : " bg-card text-muted")
              }
            >
              Q{idx}
            </button>
          );
        })}
      </div>
    );
  }
  // default grid
  return (
    <div className="grid grid-cols-10 gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const isCurrent = idx === current;
        const isAnswered = answered.has(idx);
        const isFlagged = flagged.has(idx);
        return (
          <button
            key={idx}
            onClick={() => onJump(idx)}
            className={
              "h-8 rounded-md text-xs font-medium border " +
              (isCurrent
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
  );
}
