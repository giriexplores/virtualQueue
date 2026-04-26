export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-100 animate-pulse h-32" />
        <div className="p-6 space-y-4">
          <div className="h-6 bg-slate-100 rounded animate-pulse w-3/4" />
          <div className="h-6 bg-slate-100 rounded animate-pulse w-1/2" />
          <div className="h-6 bg-slate-100 rounded animate-pulse w-2/3" />
        </div>
      </div>
    </div>
  );
}