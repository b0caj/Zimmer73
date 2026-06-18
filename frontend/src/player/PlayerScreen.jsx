import { useEffect } from 'react';

import {
  PlayerHeader,
  PlayerBoardPreview,
  Scoreboard,
  ActiveQuestionCard,
  BuzzerPanel,
  RevealedMediaContainer,
} from './playerUI';

export default function PlayerScreen({
  playerName,
  statusMessage,
  players,
  buzzerWinner,
  board,
  playedQuestions,
  activeQuestion,
  questionRevealedForPlayers,
  mediaRevealedForPlayers,
  buzzerActive,
  roomCode,
  onBuzz,
  audioAction,
}) {
  const hasActiveQuestion = !!activeQuestion;

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== 'Space') return;
      // Leertaste nur buzzern, wenn es gerade erlaubt ist (buzzerActive)
      if (!buzzerActive || buzzerWinner !== null) return;

      e.preventDefault();
      e.stopPropagation();
      onBuzz?.(roomCode);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [buzzerActive, buzzerWinner, onBuzz, roomCode]);

  return (
    <div className="w-full max-w-7xl mx-auto p-2 md:p-4 text-slate-300 animate-fadeIn font-sans">
      {/* Hauptgitter: Links das Spielgeschehen (2 Spalten Platz), rechts das Scoreboard (1 Spalte Platz) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LINKE SPALTE: SPIELINFOS, FRAGE & BOARD MATRIZEN */}
        <div className="lg:col-span-2 space-y-5 flex flex-col justify-start">
          {/* Spieler-Identität Box */}
          <PlayerHeader playerName={playerName} statusMessage={statusMessage} />

          {/* Zustand 1: Keine Frage aktiv -> Zeige das Hauptboard */}
          {!hasActiveQuestion && (
            <PlayerBoardPreview board={board} playedQuestions={playedQuestions} />
          )}

          {/* Zustand 2: Eine Frage läuft -> Zeige Frage-Karte, Medien-Container & den haptischen Buzzer */}
          {hasActiveQuestion && (
            <div className="space-y-4">
              <ActiveQuestionCard
                activeQuestion={activeQuestion}
                questionRevealedForPlayers={questionRevealedForPlayers}
              />

              <RevealedMediaContainer
                activeQuestion={activeQuestion}
                mediaRevealedForPlayers={mediaRevealedForPlayers}
                audioAction={audioAction}
              />

              <BuzzerPanel
                buzzerActive={buzzerActive}
                buzzerWinner={buzzerWinner}
                onBuzz={() => onBuzz?.(roomCode)}
                playerName={playerName}
              />

              {/* Leertaste Buzz (auch ohne Mausklick) */}
              <div className="sr-only" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* RECHTE SPALTE: HIGH-TECH SCOREBOARD (Genauso hoch wie der linke Content) */}
        <div className="h-full lg:sticky lg:top-6 min-h-[400px] lg:h-[600px]">
          <Scoreboard players={players} buzzerWinner={buzzerWinner} />
        </div>
      </div>
    </div>
  );
}

