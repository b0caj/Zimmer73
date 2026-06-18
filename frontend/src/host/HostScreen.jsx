import HostBoard from './HostBoard';
import HostScorePanel from './HostScorePanel';
import { Scoreboard } from '../player/playerUI';

export default function HostScreen({
  board,
  playedQuestions,
  activeQuestion,
  players,
  buzzerWinner,
  statusMessage,
  roomCode,
  socket,
}) {
  return (
    <div className="w-full max-w-7xl mx-auto p-2 md:p-4 text-slate-300 animate-fadeIn font-sans space-y-6">
      
      {/* OBERER HEADER-BEREICH */}
      <div className="flex justify-between items-center bg-slate-900/90 p-4 rounded-xl border border-slate-800/80 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">
            {board.title || 'Jeopardy Spiel'}
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            RAUMCODE:{' '}
            <span className="text-cyan-400 font-bold tracking-widest">{roomCode}</span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-3 py-1 rounded-full font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            Spielleiter
          </span>
        </div>
      </div>

      {/* STATUS-MELDUNG */}
      <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/60 text-center font-mono text-xs text-amber-400 backdrop-blur-sm">
        📢 {statusMessage}
      </div>

      {/* HAUPT-GRID: 2 SPALTEN AB LG-SCREENPUNKT */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* LINKE SPALTE (Gewichtung 3/5): SPIELGESCHEHEN */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900/20 rounded-2xl border border-slate-800/40 p-4 shadow-xl backdrop-blur-sm h-full flex flex-col justify-center">
            <HostBoard
              board={board}
              playedQuestions={playedQuestions}
              activeQuestion={activeQuestion}
              roomCode={roomCode}
              socket={socket}
            />
          </div>
        </div>

        {/* RECHTE SPALTE (Gewichtung 2/5): LIVE-PUNKTE & SCORE-ÄNDERUNG */}
        <div className="lg:col-span-2 flex flex-col gap-6 lg:sticky lg:top-6">
          
          {/* Rangliste (Scoreboard aus playerUI) */}
          <div className="flex-1 min-h-[250px]">
            <Scoreboard players={players} buzzerWinner={buzzerWinner} />
          </div>

          {/* Schnelle Punkteanpassung */}
          <div className="h-fit">
            <HostScorePanel
              players={players}
              activeQuestion={activeQuestion}
              buzzerWinner={buzzerWinner}
              roomCode={roomCode}
              socket={socket}
            />
          </div>

        </div>

      </div>
    </div>
  );
}