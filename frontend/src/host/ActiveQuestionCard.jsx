export default function ActiveQuestionCard({ activeQuestion }) {
  if (!activeQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto bg-slate-950/40 border border-slate-800/80 p-6 rounded-2xl shadow-2xl text-center space-y-6">
      <div className="text-xs font-mono tracking-widest text-slate-500 uppercase">
        {activeQuestion.category} — {activeQuestion.points} Punkte
      </div>

      <div className="text-xl font-bold text-white px-4">❓ {activeQuestion.text || 'Kein Text hinterlegt.'}</div>

      {/* Medien-Vorschau für den Host */}
      {/* Media is currently handled inside HostBoard to avoid wiring more props. */}

      <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl">
        <span className="text-[10px] uppercase font-mono text-emerald-600 block mb-1">Lösung für den Host:</span>
        <span className="text-sm font-bold text-emerald-400">💡 {activeQuestion.answer || 'Keine Antwort hinterlegt.'}</span>
      </div>
    </div>
  );
}

