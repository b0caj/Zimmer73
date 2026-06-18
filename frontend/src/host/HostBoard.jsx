import { useEffect, useMemo, useRef, useState } from 'react';

export default function HostBoard({
  board,
  playedQuestions,
  activeQuestion,
  roomCode,
  socket,
}) {
  if (!board?.categories) return null;

  const questionKey = useMemo(() => {
    if (!activeQuestion) return 'none';
    return `${activeQuestion.category ?? ''}-${activeQuestion.points ?? ''}-${activeQuestion.text ?? ''}`;
  }, [activeQuestion]);

  // Remount to replay CSS animation when a *different* question opens
  const [animKey, setAnimKey] = useState(0);
  const prevQuestionKeyRef = useRef(questionKey);

  useEffect(() => {
    if (!activeQuestion) return;
    if (prevQuestionKeyRef.current !== questionKey) {
      prevQuestionKeyRef.current = questionKey;
      setAnimKey((k) => k + 1);
    }
  }, [activeQuestion, questionKey]);

  if (activeQuestion) {
    return (
      <div key={animKey} className="host-question-open">
        <div className="max-w-2xl mx-auto bg-slate-950/40 border border-slate-800/80 p-6 rounded-2xl shadow-2xl text-center space-y-6">
          <div className="text-xs font-mono tracking-widest text-slate-500 uppercase">
            {activeQuestion.category} — {activeQuestion.points} Punkte
          </div>

          <div className="text-xl font-bold text-white px-4">
            ❓ {activeQuestion.text || 'Kein Text hinterlegt.'}
          </div>

          {activeQuestion?.mediaType && activeQuestion?.mediaUrl ? (
            <div className="my-4 flex justify-center w-full bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
              {activeQuestion.mediaType === 'image' ? (
                <img
                  src={activeQuestion.mediaUrl}
                  alt="Hinweis"
                  className="max-h-56 object-contain rounded border border-slate-700/80"
                />
              ) : (
                <audio controls src={activeQuestion.mediaUrl} className="w-full h-9 opacity-80" />
              )}
            </div>
          ) : null}

          {activeQuestion.mediaType === 'audio' && (
            <div className="my-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-4">
              {/* Lokales Audio-Element für den Host, damit er auch mithören kann */}
              <div className="text-left">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  Audio-Vorschau (nur Host):
                </span>
                <audio controls src={activeQuestion.mediaUrl} className="w-full h-9 opacity-90" />
              </div>

              {/* DIE ZENTRALE SYNCHRON-STEUERUNG */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block text-center font-bold">
                  🎛️ Synchrone Audio-Mischpult-Steuerung für alle Spieler
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => socket.emit('host_audio_play', roomCode)}
                    className="bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-400 font-mono font-bold py-2 rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all"
                  >
                    ▶ Play
                  </button>
                  <button
                    onClick={() => socket.emit('host_audio_pause', roomCode)}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold py-2 rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all"
                  >
                    ⏸ Pause
                  </button>
                  <button
                    onClick={() => socket.emit('host_audio_stop', roomCode)}
                    className="bg-red-950/40 hover:bg-red-950 border border-red-900/50 text-red-400 font-mono font-bold py-2 rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all"
                  >
                    ⏹ Stop / Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl">
            <span className="text-[10px] uppercase font-mono text-emerald-600 block mb-1">
              Lösung für den Host:
            </span>
            <span className="text-sm font-bold text-emerald-400">
              💡 {activeQuestion.answer || 'Keine Antwort hinterlegt.'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => socket.emit('host_reveal_text', roomCode)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider transition"
            >
              1. Text aufdecken
            </button>

            <button
              onClick={() => {
                console.log(
                  '[HOST] click host_reveal_media roomCode=',
                  roomCode,
                  'mediaUrl=',
                  activeQuestion?.mediaUrl,
                );
                socket.emit('host_reveal_media', roomCode);
              }}
              disabled={!activeQuestion?.mediaUrl}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider transition"
            >
              2. Medien freischalten
            </button>

            <button
              onClick={() => socket.emit('activate_question', roomCode)}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider transition"
            >
              3. Buzzer freigeben
            </button>

            <button
              onClick={() => socket.emit('wrong_answer', roomCode)}
              className="bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-900/50 font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider transition"
            >
              Buzzer resetten (Falsch)
            </button>

            <button
              onClick={() => socket.emit('host_cancel_question', roomCode)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider transition"
            >
              Frage schließen (ohne Haken)
            </button>

            <button
              onClick={() => socket.emit('host_close_question', roomCode)}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider transition"
            >
              Frage schließen & Haken dran
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-4">
      {board.categories.map((cat, catIdx) => (
        <div key={catIdx} className="space-y-3">
          <div className="bg-blue-950/80 border border-blue-900/70 text-blue-200 text-center font-black rounded-xl p-3 text-xs uppercase truncate tracking-wider shadow-md">
            {cat.name}
          </div>

          <div className="space-y-2">
            {cat.questions.map((q, qIdx) => {
              const key = `${cat.name}-${q.points}`;
              const isPlayed = playedQuestions.includes(key);

              return (
                <button
                  key={qIdx}
                  disabled={isPlayed}
                  onClick={() =>
                    socket.emit('host_select_question', {
                      roomCode,
                      categoryName: cat.name,
                      question: q,
                    })
                  }
                  className={
                    'w-full font-mono font-black text-center py-4 rounded-xl border text-sm transition-all shadow ' +
                    (isPlayed
                      ? 'bg-slate-950/70 border-slate-900/70 text-slate-800 cursor-not-allowed line-through'
                      : 'bg-slate-900/60 border-slate-800/80 text-amber-300 hover:border-amber-500 hover:bg-slate-850 active:scale-95')
                  }
                >
                  {q.points}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

