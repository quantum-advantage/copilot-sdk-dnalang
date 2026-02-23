import { Skeleton } from "@/components/ui/skeleton"

export default function DNANotebookLoading() {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar skeleton */}
      <div className="border-b border-border/50 px-4 py-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="w-28 h-4 rounded" />
            <Skeleton className="w-16 h-4 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="w-20 h-8 rounded" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-24 h-3 rounded" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4 space-y-3 max-w-4xl mx-auto w-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border/40 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-card/40">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="w-16 h-4 rounded" />
                  <Skeleton className="w-8 h-4 rounded" />
                </div>
                <Skeleton className="w-16 h-6 rounded" />
              </div>
              <div className="p-4 space-y-2">
                <Skeleton className="w-full h-4 rounded" />
                <Skeleton className="w-3/4 h-4 rounded" />
                <Skeleton className="w-1/2 h-4 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="w-80 border-l border-border/50 p-3 space-y-3">
          <Skeleton className="w-full h-8 rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-12 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
