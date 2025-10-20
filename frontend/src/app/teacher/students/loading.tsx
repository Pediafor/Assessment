import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-32"><Skeleton /></div>
      <div className="rounded-md border overflow-x-auto p-4 space-y-3">
        {[1,2,3,4].map((i) => (
          <div key={i} className="grid grid-cols-5 gap-3 items-center">
            <div className="h-4 w-12"><Skeleton /></div>
            <div className="h-4 w-40"><Skeleton /></div>
            <div className="h-4 w-56"><Skeleton /></div>
            <div className="h-4 w-16"><Skeleton /></div>
            <div className="h-8 w-40 justify-self-end"><Skeleton /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
