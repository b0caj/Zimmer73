export default function StartMenu({
  supabaseBoards,
  selectedBoardId,
  setSelectedBoardId,
  roomCode,
  setRoomCode,
  playerName,
  setPlayerName,
  handleCreateHost,
  handleJoinPlayer,
  onOpenBuilder,
}) {
  return (
    <div className="max-w-5xl mx-auto bg-slate-950/40 rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-800/60 text-center glass-surface relative overflow-hidden animate-fadeIn backdrop-blur-md">
      
      {/* Atmosphärische Neon-Aura im Hintergrund */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-400/10 blur-[100px] rounded-full animate-pulse duration-3000" />
        <div className="absolute inset-0 ring-1 ring-white/5 rounded-3xl" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Haupt-Header mit Gaming-Glow */}
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white select-none filter drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            JEOPARDY<span className="text-cyan-400 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">LIVE</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-mono tracking-[0.15em] uppercase font-bold">
            ⚡ Das ultimative Echtzeit-Quiz für deine Party ⚡
          </p>
        </div>

        {/* Die beiden Haupt-Sektionen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
          
          {/* LINKER BEREICH: HOST (Spielleiter) */}
          <div className="p-5 md:p-6 bg-slate-950/70 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-lg group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="space-y-4">
              <div className="text-left">
                <span className="text-[10px] font-mono font-black text-cyan-400 tracking-widest uppercase bg-cyan-950/50 px-2.5 py-1 rounded-md border border-cyan-900/30">
                  Aktion 1
                </span>
                <h2 className="text-lg font-bold text-white mt-2 tracking-tight">Spiel leiten</h2>
                <p className="text-xs text-slate-400 mt-0.5">Erstelle einen Raum und präsentiere das Board auf dem Fernseher.</p>
              </div>

              <div className="space-y-2 text-left pt-2">
                <label className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider block">
                  Wähle dein Quiz-Board:
                </label>
                <select
                  value={selectedBoardId}
                  onChange={(e) => setSelectedBoardId(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-colors cursor-pointer appearance-none shadow-inner"
                  style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'right 12px center', backgroundSize: '16px', backgroundRepeat: 'no-repeat' }}
                >
                  <option value="">Standard Jeopardy-Board (Lokal)</option>
                  {supabaseBoards.map((b) => (
                    <option key={b.id} value={b.id}>
                      ☁️ {b.title} (Cloud Matrix)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleCreateHost}
                className="w-full bg-gradient-to-b from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-black py-3 px-4 rounded-xl text-xs md:text-sm tracking-wider transition-all transform hover:scale-[1.01] active:scale-[0.99] uppercase shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.4)]"
              >
                🚀 Raum erstellen & Starten
              </button>
            </div>
          </div>

          {/* RECHTER BEREICH: SPIELER (Buzzer-Verbindung) */}
          <div className="p-5 md:p-6 bg-slate-950/70 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between shadow-lg group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="space-y-4">
              <div className="text-left">
                <span className="text-[10px] font-mono font-black text-emerald-400 tracking-widest uppercase bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-900/30">
                  Aktion 2
                </span>
                <h2 className="text-lg font-bold text-white mt-2 tracking-tight">Als Spieler beitreten</h2>
                <p className="text-xs text-slate-400 mt-0.5">Verwende dein Smartphone oder Tablet als haptischen Buzzer.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="RAUMCODE"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900/90 border border-slate-800 text-center font-mono font-black tracking-widest text-white rounded-xl p-3 text-sm uppercase placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors shadow-inner"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="DEIN NAME"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 text-center text-slate-200 rounded-xl p-3 text-xs placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors shadow-inner font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleJoinPlayer}
                className="w-full bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs md:text-sm tracking-wider transition-all transform hover:scale-[1.01] active:scale-[0.99] uppercase shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)]"
              >
                🎮 In die Lobby einloggen
              </button>
            </div>
          </div>

        </div>

        {/* Studio-Link ganz unten sauber abgesetzt */}
        <div className="pt-4 flex justify-center">
          <button
            onClick={onOpenBuilder}
            className="relative group px-5 py-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-cyan-500/30 text-xs text-slate-400 hover:text-cyan-400 font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95"
          >
            <span className="flex items-center gap-2">
              <span>🛠️</span>
              <span>Studio-Builder öffnen</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}