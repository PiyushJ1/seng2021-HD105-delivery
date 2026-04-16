export function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-slate-500">This section is under development</p>
      </div>
      <div className="flex h-96 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <span className="text-lg font-semibold text-slate-600">UC</span>
          </div>
          <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
          <p className="max-w-md text-sm text-slate-500">
            This feature is coming soon. The {title.toLowerCase()} module will
            allow you to manage related business processes efficiently.
          </p>
        </div>
      </div>
    </div>
  );
}
