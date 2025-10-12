"use client";
import React from "react";
import type { Question } from "./types";

export function QuestionRenderer({
  q,
  value,
  onChange,
  onFlag,
  flagged,
  readOnly = false,
}: {
  q: Question;
  value: unknown;
  onChange: (next: unknown) => void;
  onFlag: (flag: boolean) => void;
  flagged: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted">Question</div>
          <div className="font-medium">{q.prompt}</div>
        </div>
        {!readOnly && (
          <label className="text-xs inline-flex items-center gap-2">
            <input type="checkbox" checked={flagged} onChange={(e) => onFlag(e.target.checked)} />
            Flag for review
          </label>
        )}
      </div>
      {q.type === "mcq" && Array.isArray((q as any).choices) && (
        <div className="space-y-2">
          {(q as any).choices.map((c: any) => (
            <label key={c.id} className="flex items-center gap-2">
              <input type="radio" name={q.id} checked={value === c.id} onChange={() => onChange(c.id)} disabled={readOnly} />
              <span>{c.text}</span>
            </label>
          ))}
        </div>
      )}
      {q.type === "multi" && Array.isArray((q as any).choices) && (
        <div className="space-y-2">
          {(q as any).choices.map((c: any) => {
            const set = new Set(Array.isArray(value) ? (value as any[]) : []);
            const checked = set.has(c.id);
            return (
              <label key={c.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = new Set(set);
                    if (e.target.checked) next.add(c.id);
                    else next.delete(c.id);
                    onChange(Array.from(next));
                  }}
                  disabled={readOnly}
                />
                <span>{c.text}</span>
              </label>
            );
          })}
        </div>
      )}
      {q.type === "truefalse" && (
        <div className="space-x-4">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name={q.id} checked={value === true} onChange={() => onChange(true)} disabled={readOnly} /> True
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name={q.id} checked={value === false} onChange={() => onChange(false)} disabled={readOnly} /> False
          </label>
        </div>
      )}
      {q.type === "short" && (
        <input className="w-full rounded-md border bg-transparent px-3 py-2" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} disabled={readOnly} />
      )}
      {q.type === "essay" && (
        <textarea className="w-full min-h-40 rounded-md border bg-transparent px-3 py-2" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} disabled={readOnly} />
      )}
      {q.type === "file" && (
        <input type="file" className="block" onChange={(e) => onChange(e.target.files && e.target.files[0])} disabled={readOnly} />
      )}
      {q.type === "media" && q.mediaUrl && (
        <div>
          {/* Media preview */}
          {q.mediaUrl.match(/\.(png|jpg|jpeg|gif|svg)$/i) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={q.mediaUrl} alt="media" className="max-h-60 rounded-md border" />
          ) : q.mediaUrl.match(/\.(mp4|webm)$/i) ? (
            <video src={q.mediaUrl} controls className="max-h-60 rounded-md border" />
          ) : q.mediaUrl.match(/\.(mp3|wav)$/i) ? (
            <audio src={q.mediaUrl} controls />
          ) : null}
        </div>
      )}
    </div>
  );
}
