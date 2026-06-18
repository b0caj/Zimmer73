export default function HostScorePanel({ players, activeQuestion, buzzerWinner, roomCode, socket }) {
  return (
    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl shadow-xl p-4 space-y-3 h-full">
      <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase font-mono">🧮 Score ändern</h3>
      <p className="text-[11px] text-slate-500 font-mono">Nur verfügbar, wenn eine Frage aktiv ist.</p>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
        {players.map((p) => {
          const isWinner = buzzerWinner?.playerId === p.id;
          return (
            <div
              key={p.id}
              className={
                'p-3 rounded-xl border flex items-center justify-between gap-3 ' +
                (isWinner
                  ? 'border-amber-500/70 bg-amber-500/10'
                  : 'border-slate-800 bg-slate-950/40')
              }
            >
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                  {isWinner && '⚡'} {p.name}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 font-bold">{p.score} $</div>
              </div>

              {activeQuestion ? (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      socket.emit('update_score', {
                        roomCode,
                        playerId: p.id,
                        pointsChange: -parseInt(activeQuestion.points),
                      })
                    }
                    className="bg-red-950/60 hover:bg-red-950 text-red-400 font-mono font-bold w-9 h-9 rounded-lg flex items-center justify-center text-sm border border-red-900/40"
                  >
                    -
                  </button>
                  <button
                    onClick={() =>
                      socket.emit('update_score', {
                        roomCode,
                        playerId: p.id,
                        pointsChange: parseInt(activeQuestion.points),
                      })
                    }
                    className="bg-emerald-950/60 hover:bg-emerald-950 text-emerald-300 font-mono font-bold w-9 h-9 rounded-lg flex items-center justify-center text-sm border border-emerald-900/40"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 font-mono">—</div>
              )}
            </div>
          );
        })}

        {players.length === 0 && (
          <p className="text-xs text-slate-500 italic font-mono">Warte auf Spieler...</p>
        )}
      </div>
    </div>
  );
}

