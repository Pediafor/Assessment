import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <section>
        <div className="h-6 w-48 mb-2"><Skeleton /></div>
        <div className="rounded-md border p-4">
          <div className="h-4 w-1/2"><Skeleton /></div>
        </div>
      </section>
      <section>
        <div className="h-6 w-44 mb-2"><Skeleton /></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-md border p-4">
              <div className="h-5 w-3/4 mb-2"><Skeleton /></div>
              <div className="h-4 w-1/2"><Skeleton /></div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="h-6 w-40 mb-2"><Skeleton /></div>
        <div className="rounded-md border p-4">
          <div className="h-4 w-1/2 mb-2"><Skeleton /></div>
          <div className="h-24 w-full"><Skeleton /></div>
        </div>
      </section>
    </div>
  );
}
