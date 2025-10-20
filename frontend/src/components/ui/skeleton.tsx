import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Visible in both light and dark themes
        // Use neutral backgrounds so the pulse is perceptible on white too
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
      aria-busy
      {...props}
    />
  );
}

export function Spinner({ size = 16, className, label = "Loading" }: { size?: number; className?: string; label?: string }) {
  return (
    <div role="status" aria-label={label} className={cn("inline-flex items-center gap-2", className)}>
      <svg
        className="animate-spin"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
