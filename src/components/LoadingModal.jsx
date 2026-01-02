function LoadingModal({ open, text = '読み込み中...' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex min-w-[260px] items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl ring-1 ring-slate-200">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        <div>
          <p className="text-sm font-semibold text-slate-900">少々お待ちください</p>
          <p className="text-xs text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}

export default LoadingModal;

