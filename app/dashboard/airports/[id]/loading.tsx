// app/dashboard/airports/[id]/loading.tsx
export default function AirportDetailsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="h-9 w-24 bg-muted rounded animate-pulse" />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-muted rounded animate-pulse" />
          <div className="h-48 bg-muted rounded animate-pulse" />
          <div className="h-40 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}