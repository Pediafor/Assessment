import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[1,2,3].map((i) => (
          <div key={i} className="rounded-md border p-4">
            <div className="h-4 w-24 mb-2"><Skeleton /></div>
            <div className="h-8 w-16"><Skeleton /></div>
          </div>
        ))}
      </div>
      <div className="rounded-md border p-6">
        <div className="h-4 w-1/2 mb-2"><Skeleton /></div>
        <div className="h-64 w-full"><Skeleton /></div>
      </div>
    </div>
  );
}
