import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-40"><Skeleton /></div>
        <div className="h-9 w-40"><Skeleton /></div>
      </div>
      <div className="rounded-md border overflow-x-auto p-4">
        <div className="space-y-3">
          {[1,2,3,4].map((i) => (
            <div key={i} className="grid grid-cols-5 gap-3 items-center">
              <div className="h-4 w-16"><Skeleton /></div>
              <div className="h-4 w-40"><Skeleton /></div>
              <div className="h-4 w-12"><Skeleton /></div>
              <div className="h-4 w-12"><Skeleton /></div>
              <div className="h-5 w-20"><Skeleton /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
