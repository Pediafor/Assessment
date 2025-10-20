"use client";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssessmentPlayerLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-7 w-24" />
      </div>
      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
