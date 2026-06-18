import { useMemo, useEffect, useRef } from 'react';


export function MediaRenderer({ type, url }) {

  if (!url || type === 'none') return null;
  return (
    <div className="my-4 flex justify-center w-full bg-slate-900/40 p-2 rounded-lg border border-slate-800">
      {type === 'image' && (
        <img src={url} alt="Hinweis" className="max-h-56 object-contain rounded border border-slate-850" />
      )}
      {type === 'audio' && <audio controls src={url} className="w-full h-9 opacity-80" />}
    </div>
  );
}

export function PlayerHeader({ playerName, statusMessage }) {
  return (
    <div className="border border-slate-800 bg-slate-950/80 rounded-xl p-4 text-left relative shadow-[0_0_15px_rgba(6,182,212,0.05)]">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block">
          Deine Spieler-Identität
        </span>
        <span className="text-[9px] font-mono font-bold tracking-wider bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase border border-amber-500/30">
          • Player View
        </span>
      </div>
      <h2 className="text-xl font-black text-cyan-400 font-mono tracking-wide mt-1">
        {playerName || 'ANONYM'}
      </h2>
      <div className="text-xs text-slate-400 mt-1 font-mono">
        Status: <span className="text-slate-300">{statusMessage}</span>
      </div>
    </div>
  );
}

// Das 5x5 Grid im exakten Look des Screenshots
export function PlayerBoardPreview({ board, playedQuestions }) {
  return (
    <div className="border border-slate-800 bg-slate-950/90 rounded-2xl p-5 text-left relative shadow-[0_0_20px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-3">
        <span>📺</span>
        <span className="font-bold uppercase tracking-wider text-slate-300">Board</span>
        <span className="text-slate-600 font-normal ml-1">— Auswahl erfolgt durch den Host.</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[500px] grid grid-cols-5 border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950">
          {/* Kategorien-Köpfe */}
          {board?.categories?.map((cat, idx) => (
            <div
              key={idx}
              className="p-2.5 text-[10px] font-black text-center text-slate-300 tracking-wider font-mono uppercase bg-slate-900/60 border-b border-r border-slate-800/80 last:border-r-0 truncate"
            >
              {cat.name}
            </div>
          ))}

          {/* 5 Zeilen Punkte (100 bis 500) */}
          {[0, 1, 2, 3, 4].map((rowIndex) => (
            <div key={rowIndex} className="col-span-5 grid grid-cols-5">
              {board?.categories?.map((cat, catIdx) => {
                const q = cat.questions?.[rowIndex] || { points: (rowIndex + 1) * 100 };
                const isPlayed = playedQuestions?.includes(`${cat.name}-${q.points}`);

                return (
                  <div
                    key={catIdx}
                    className="aspect-[4/3] flex items-center justify-center border-b border-r border-slate-800/80 last:border-r-0 font-mono font-black text-lg transition-all relative bg-slate-950"
                  >
                    {!isPlayed ? (
                      <span className="text-cyan-400 filter drop-shadow-[0_0_6px_rgba(34,211,238,0.75)] tracking-wide selection:bg-transparent">
                        {q.points}
                      </span>
                    ) : (
                      <span className="text-slate-850 line-through select-none text-sm">✕</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Das Scoreboard auf der rechten Seite im High-Tech List-Look
export function Scoreboard({ players, buzzerWinner }) {
  const sorted = useMemo(
    () => [...(players || [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    [players]
  );

  return (
    <div className="border border-cyan-500/40 bg-slate-950/90 rounded-2xl p-5 text-left h-full shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col">
      <div className="text-xs font-mono font-black tracking-widest text-slate-200 uppercase">
        Scoreboard
      </div>
      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800/60 pb-2">
        Player Ranking
      </div>

      <div className="space-y-2.5 flex-1 overflow-auto custom-scrollbar pr-1">
        {sorted.map((p, idx) => {
          const isWinner = buzzerWinner?.playerId === p.id;
          return (
            <div
              key={p.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all font-mono ${isWinner
                ? 'bg-cyan-950/30 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/40 border-slate-800/80'
                }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shadow-inner ${isWinner ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-500 border border-slate-800'
                  }`}>
                  {isWinner ? '⚡' : idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">{p.name}</div>
                  <div className="text-[9px] text-slate-500">
                    {isWinner ? 'Buzzed!' : 'Stand by'}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-black text-slate-200 tracking-tight">
                  {String(p.score ?? 0).padStart(2, '0')}
                </div>
                <div className="text-[9px] text-slate-500 uppercase">points</div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-xs text-slate-600 font-mono italic text-center py-4">Warte auf Teilnehmer...</p>
        )}
      </div>
    </div>
  );
}

// Hilfs-Komponenten für Phasen & Fragen
// (Unbenutzt) PhaseBanner im neuen Design nicht benötigt.
export function PhaseBanner() {
  return null;
}




export function ActiveQuestionCard({ activeQuestion, questionRevealedForPlayers }) {
  if (!activeQuestion) return null;

  return (
    <div className="border border-slate-800 bg-slate-950 rounded-2xl p-6 text-center space-y-4 shadow-xl border-t-2 border-t-cyan-500/40">
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase border-b border-slate-900 pb-2">
        <span>{activeQuestion.category}</span>
        <span className="text-cyan-400 font-bold">{activeQuestion.points} Punkte</span>
      </div>

      {questionRevealedForPlayers ? (
        <p className="text-base text-slate-200 font-medium leading-relaxed">{activeQuestion.text}</p>
      ) : (
        <p className="text-xs text-slate-500 italic font-mono animate-pulse">Der Host liest die Frage gerade vor...</p>
      )}
    </div>
  );
}

export function RevealedMediaContainer({ activeQuestion, mediaRevealedForPlayers, audioAction }) {
  const audioRef = useRef(null);
  const lastAudioActionRef = useRef(audioAction);



  // Merken: falls ein play/pause kommt bevor das <audio> gemountet ist
  useEffect(() => {
    lastAudioActionRef.current = audioAction;

    if (!audioRef.current) return;

    const current = lastAudioActionRef.current;
    if (!current?.type) return;

    // ms-nahe Synchronität: für play mit serverTime einen gemeinsamen Start berechnen
    if (current.type === 'play') {
      const serverTime = typeof current.serverTime === 'number' ? current.serverTime : Date.now();
      const now = Date.now();
      const elapsedMs = Math.max(0, now - serverTime);
      const elapsedSeconds = elapsedMs / 1000;



      // Wenn schon ein bisschen Zeit vergangen ist, seeken wir passend.
      // Danach playen wir.
      try {
        audioRef.current.currentTime = elapsedSeconds;
      } catch (e) {
        // seek kann bei noch nicht geladenem metadata scheitern -> wird über apply-effect unten nochmal versucht
      }

      audioRef.current.play().catch(err => console.log("Audio-Play blockiert:", err));
    } else if (current.type === 'pause') {
      audioRef.current.pause();
    } else if (current.type === 'stop') {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioAction]);


  // Sobald das <audio> überhaupt im DOM ist, applyen wir das zuletzt bekannte Kommando nochmal.
  // Dadurch geht kein play verloren, falls es vor dem Mount kam.
  useEffect(() => {
    if (!audioRef.current) return;

    const current = lastAudioActionRef.current;
    if (!current?.type) return;

    if (current.type === 'play') {
      const serverTime = typeof current.serverTime === 'number' ? current.serverTime : Date.now();
      const now = Date.now();
      const elapsedMs = Math.max(0, now - serverTime);
      const elapsedSeconds = elapsedMs / 1000;

      try {
        audioRef.current.currentTime = elapsedSeconds;
      } catch (e) {
        // falls noch keine seek-able metadata vorhanden ist
      }

      audioRef.current.play().catch(err => console.log("Audio-Play (nach Mount) blockiert:", err));
    } else if (current.type === 'pause') {
      audioRef.current.pause();
    } else if (current.type === 'stop') {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [mediaRevealedForPlayers, activeQuestion?.mediaUrl, activeQuestion?.mediaType]);


  if (!activeQuestion || !activeQuestion.mediaUrl || activeQuestion.mediaType === 'none') {
    return null;
  }


  return (
    <div className="border border-slate-800 bg-slate-950/90 rounded-2xl p-4 text-center shadow-md">
      {mediaRevealedForPlayers ? (
        <div className="w-full bg-slate-900/40 p-4 rounded-lg border border-slate-800/60 animate-fadeIn flex flex-col items-center justify-center">
          {activeQuestion.mediaType === 'image' && (
            <img
              src={activeQuestion.mediaUrl}
              alt="Hinweis"
              className="max-h-56 object-contain rounded border border-slate-800"
            />
          )}
          {activeQuestion.mediaType === 'audio' && (
            <div className="w-full space-y-2">
              {/* Unsichtbares Audio-Element ohne Controls für den Spieler */}
              <audio ref={audioRef} src={activeQuestion.mediaUrl} preload="auto" />

              {/* Schicke visuelle Cyberpunk-Anzeige anstelle von Controls */}
              <div className="flex items-center justify-center gap-3 py-2 bg-slate-950 rounded-xl border border-slate-900 px-4">
                <span className="text-cyan-400 animate-pulse text-sm">🎵</span>
                <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full bg-cyan-500 rounded-full ${audioAction?.type === 'play'
                        ? 'w-full transition-all duration-[30s] linear'
                        : 'w-0'
                      }`}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  {audioAction?.type === 'play' ? 'Spielt ab...' : 'Pausiert'}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (

        <div className="py-3 flex flex-col items-center justify-center space-y-1.5">
          <span className="text-xl animate-pulse">🖼️</span>
          <p className="text-[11px] font-mono text-slate-500 italic">
            Medium gesperrt — Der Host hat den Hinweis noch nicht freigegeben.
          </p>
        </div>
      )}
    </div>
  );
}

export function BuzzerPanel({ buzzerActive, buzzerWinner, onBuzz }) {
  return (
    <div className="pt-2">
      <button
        disabled={!buzzerActive || buzzerWinner !== null}
        onClick={onBuzz}
        className={`w-full py-6 rounded-2xl border font-mono font-black tracking-widest text-sm uppercase transition-all transform active:scale-[0.99] shadow-xl ${buzzerWinner
          ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
          : buzzerActive
            ? 'bg-gradient-to-b from-red-600 to-rose-700 border-red-400 text-white shadow-[0_0_30px_rgba(220,38,38,0.35)] animate-pulse'
            : 'bg-slate-900/60 border-slate-850 text-slate-500 cursor-not-allowed'
          }`}
      >
        {buzzerWinner ? `🔒 GESPERRT (${buzzerWinner.playerName})` : buzzerActive ? '🔥 JETZT BUZZERN!' : '🔒 WAITING FOR HOST'}
      </button>
    </div>
  );
}

