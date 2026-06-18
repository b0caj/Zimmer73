export default function AppShell({ title, subtitle, rightSlot, children }) {
  return (
    <div className="min-h-screen w-full">
      <div className="relative w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 h-full">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {title && (
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs md:text-sm text-slate-400 font-mono mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {rightSlot}
          </div>

          <div className="mt-6 glass-surface rounded-2xl p-4 md:p-6 border border-[rgba(148,163,184,0.16)] h-[calc(100vh-6rem)] min-h-[420px] overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}


