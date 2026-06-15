import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { initialBoard } from './questions';
import JeopardyBuilder from './JeopardyBuilder';
import { supabase } from './supabaseClient';

const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'Dhttps://projekt73.onrender.com' 
  : 'http://localhost:3001';

const socket = io(BACKEND_URL);

function MediaRenderer({ type, url }) {
  if (!url || type === 'none') return null;
  return (
    <div className="my-4 flex justify-center w-full bg-slate-900 p-2 rounded-lg border border-slate-800">
      {type === 'image' && (
        <img src={url} alt="Hinweis" className="max-h-48 object-contain rounded border border-slate-850" />
      )}
      {type === 'audio' && (
        <audio controls src={url} className="w-full h-8 opacity-75" />
      )}
    </div>
  );
}

function App() {
  const [role, setRole] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);

  // States für Supabase Cloud-Laden
  const [supabaseBoards, setSupabaseBoards] = useState([]);

  const [board, setBoard] = useState(initialBoard);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [playedQuestions, setPlayedQuestions] = useState([]);
  const [questionRevealedForPlayers, setQuestionRevealedForPlayers] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const [showAnswer, setShowAnswer] = useState(false);
  const [buzzerWinner, setBuzzerWinner] = useState(null);
  const [buzzerWinnerId, setBuzzerWinnerId] = useState(null);
  const [buzzerActive, setBuzzerActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('System bereit');

  const handleLocalBoardUpload = (event) => {
    const fileReader = new FileReader();
    if (!event.target.files[0]) return;
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.title && parsed.categories) {
          setBoard(parsed);
        }
      } catch (err) {
        alert("Fehler beim Import.");
      }
    };
  };

  // Cloud Boards beim Starten laden
  useEffect(() => {
    async function loadBoards() {
      try {
        const { data, error } = await supabase.from('boards').select('id, title, categories');
        if (error) console.error("Supabase-Ladefehler:", error.message);
        if (data) setSupabaseBoards(data);
      } catch (err) {
        console.error("Supabase nicht konfiguriert oder erreichbar:", err);
      }
    }
    loadBoards();
  }, [isBuilding]); // Lädt die Boards auch neu, wenn man aus dem Editor zurückkommt

  const handleSelectSupabaseBoard = (boardId) => {
    const selected = supabaseBoards.find(b => b.id === boardId);
    if (selected) {
      setBoard({ title: selected.title, categories: selected.categories });
    }
  };

  useEffect(() => {
    socket.on('room_created', () => setJoined(true));
    socket.on('joined_successfully', (data) => {
      setJoined(true);
      if (data.board) setBoard(data.board);
      setActiveQuestion(data.activeQuestion);
      setPlayedQuestions(data.playedQuestions);
    });
    socket.on('update_players', (playerList) => setPlayers(playerList));

    socket.on('sync_question_opened', (question) => {
      setActiveQuestion(question);
      setQuestionRevealedForPlayers(false);
      setBuzzerWinner(null);
      setBuzzerWinnerId(null);
      setBuzzerActive(false);
      setStatusMessage('Frage wird vorbereitet...');
    });

    socket.on('sync_text_revealed', () => {
      setQuestionRevealedForPlayers(true);
      setStatusMessage('Inhalt eingeblendet');
    });

    socket.on('question_active', () => {
      setBuzzerActive(true);
      setBuzzerWinner(null);
      setBuzzerWinnerId(null);
      setStatusMessage('BUZZER SCHARF');
    });

    socket.on('sync_question_closed', (updated) => {
      setPlayedQuestions(updated);
      setActiveQuestion(null);
      setQuestionRevealedForPlayers(false);
      setBuzzerActive(false);
      setBuzzerWinner(null);
      setBuzzerWinnerId(null);
      setStatusMessage('Warte auf nächste Auswahl');
    });

    socket.on('player_buzzed', (data) => {
      setBuzzerWinner(data.playerName);
      setBuzzerWinnerId(data.playerId);
      setBuzzerActive(false);
    });

    return () => {
      socket.off('room_created');
      socket.off('joined_successfully');
      socket.off('update_players');
      socket.off('sync_question_opened');
      socket.off('sync_text_revealed');
      socket.off('question_active');
      socket.off('sync_question_closed');
      socket.off('player_buzzed');
    };
  }, []);

  const handleCreateRoom = () => {
    if (!roomCode) return;
    setRole('host');
    socket.emit('create_room', { roomCode, board });
  };

  const handleJoinRoom = () => {
    if (!roomCode || !playerName) return;
    setRole('player');
    socket.emit('join_room', { roomCode, playerName });
  };

  const selectQuestion = (catName, q) => {
    if (role !== 'host') return;
    if (playedQuestions.includes(`${catName}-${q.points}`)) return;
    socket.emit('host_select_question', { roomCode, categoryName: catName, question: q });
    setShowAnswer(false);
  };

  const changeScore = (id, change) => socket.emit('update_score', { roomCode, playerId: id, pointsChange: change });

  const handleCloseQuestion = () => {
    socket.emit('host_close_question', roomCode);
  };

  const handleWrongAnswer = () => {
    if (!buzzerWinnerId) return;
    changeScore(buzzerWinnerId, -activeQuestion.points);
    setBuzzerWinner(null);     
    setBuzzerWinnerId(null);   
    socket.emit('wrong_answer', roomCode); 
  };

  const RenderBoard = ({ isInteractive }) => {
    const cols = board?.categories?.length || 5;
    return (
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {board.categories.map((cat) => (
          <div key={cat.name} className="space-y-2">
            <div className="bg-slate-900 border border-slate-800 text-center py-2.5 rounded-lg font-medium text-[11px] tracking-wider text-slate-400 uppercase truncate px-1">
              {cat.name}
            </div>
            {cat.questions.map((q) => {
              const played = playedQuestions.includes(`${cat.name}-${q.points}`);
              return (
                <button
                  key={q.points}
                  disabled={played || !isInteractive}
                  onClick={() => selectQuestion(cat.name, q)}
                  className={`w-full py-4 text-sm font-semibold font-mono rounded-lg border transition-all ${played
                      ? 'bg-slate-950 text-slate-800 border-slate-950 cursor-not-allowed'
                      : isInteractive
                        ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                        : 'bg-slate-900 border-slate-850 text-slate-500 cursor-default'
                    }`}
                >
                  {played ? '·' : q.points}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  if (isBuilding) return <JeopardyBuilder onBack={() => setIsBuilding(false)} />;

  /* --- LOGIN VIEW --- */
  if (!joined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-300 p-4">
        <div className="w-full max-w-xs space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-medium tracking-tight text-white">Jeopardy Live</h1>
            <p className="text-xs text-slate-500">Minimalistisches Quiz-System</p>
          </div>

          <div className="space-y-4">
            <input
              type="text" placeholder="RAUMCODE" value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-center text-sm font-semibold tracking-widest text-white focus:outline-none focus:border-slate-700"
            />

            {/* Supabase Cloud-Auswahl */}
            <div className="border-t border-slate-900 pt-4 space-y-2">
              <label className="text-[10px] font-mono tracking-wider text-slate-500 block uppercase">☁️ Cloud-Board wählen</label>
              <select 
                onChange={(e) => handleSelectSupabaseBoard(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2 py-2 focus:outline-none focus:border-slate-700"
              >
                <option value="">-- Board aus Supabase wählen --</option>
                {supabaseBoards.map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>

              <div className="text-center text-[10px] text-slate-600 my-1">oder lokal:</div>
              <label className="border border-slate-800 hover:bg-slate-900 py-2 rounded-lg text-xs text-slate-400 flex flex-col items-center justify-center cursor-pointer transition">
                <span>📂 Backup-JSON laden</span>
                {board.title !== "Allgemeinwissen" && <span className="text-amber-400 font-mono text-[10px] mt-0.5">{board.title}</span>}
                <input type="file" accept=".json" onChange={handleLocalBoardUpload} className="hidden" />
              </label>

              <button onClick={handleCreateRoom} className="w-full bg-slate-200 hover:bg-white text-slate-950 text-xs font-semibold py-2.5 rounded-lg transition mt-2">
                Als Host starten
              </button>
            </div>

            <div className="border-t border-slate-900 pt-4 space-y-2">
              <input
                type="text" placeholder="Dein Spielername" value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-center text-xs focus:outline-none focus:border-slate-700"
              />
              <button onClick={handleJoinRoom} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2.5 rounded-lg transition">
                Als Spieler beitreten
              </button>
            </div>

            <button onClick={() => setIsBuilding(true)} className="w-full text-slate-500 hover:text-slate-400 text-center text-[11px] pt-2 font-medium block">
              → Zum Board-Editor wechseln
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* --- HOST VIEW --- */
  if (role === 'host') {
    return (
      <div className="p-6 max-w-[95vw] mx-auto space-y-6 text-slate-300 min-h-screen bg-slate-950">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4">
          <div className="text-sm font-medium text-white">Raum: <span className="font-mono text-amber-400">{roomCode}</span></div>
          <div className="flex gap-4">
            {players.map(p => (
              <div key={p.id} className="text-xs bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-lg flex items-center gap-3">
                <span className="font-medium text-slate-400">{p.name}</span>
                <span className="font-mono font-bold text-white">{p.score}</span>
                <div className="flex gap-1">
                  <button onClick={() => changeScore(p.id, 100)} className="text-[10px] text-slate-500 hover:text-white px-1">+</button>
                  <button onClick={() => changeScore(p.id, -100)} className="text-[10px] text-slate-500 hover:text-white px-1">-</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!activeQuestion ? (
          <RenderBoard isInteractive={true} />
        ) : (
          <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center space-y-6 max-w-2xl mx-auto">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">{activeQuestion.category} · {activeQuestion.points} PKT</div>
            <div className="text-xl font-medium text-white px-4 leading-relaxed">"{activeQuestion.text}"</div>

            <MediaRenderer type={activeQuestion.mediaType} url={activeQuestion.mediaUrl} />

            {showAnswer && (
              <div className="text-sm font-medium text-emerald-400 bg-slate-950 py-2 px-4 rounded border border-slate-850 inline-block">
                Lösung: {activeQuestion.answer}
              </div>
            )}

            <div className="border-t border-slate-850 pt-6 flex justify-center gap-2 text-xs font-medium">
              <button
                onClick={() => socket.emit('host_reveal_text', roomCode)}
                disabled={questionRevealedForPlayers}
                className="border border-slate-800 hover:bg-slate-800 text-slate-200 px-4 py-2 rounded-lg disabled:opacity-20 transition"
              >
                {questionRevealedForPlayers ? '✓ Text sichtbar' : 'Text einblenden'}
              </button>

              <button
                onClick={() => socket.emit('activate_question', roomCode)}
                disabled={buzzerActive || buzzerWinner}
                className="bg-slate-200 hover:bg-white text-slate-950 px-4 py-2 rounded-lg disabled:opacity-30 transition font-semibold"
              >
                {buzzerActive ? '⚡ Buzzer ist scharf' : 'Buzzer freigeben'}
              </button>

              <button onClick={() => setShowAnswer(!showAnswer)} className="border border-slate-800 hover:bg-slate-800 px-4 py-2 rounded-lg transition">
                {showAnswer ? 'Lösung verstecken' : 'Lösung anzeigen'}
              </button>
            </div>

            {buzzerWinner && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 mt-4 space-y-3">
                <div className="text-xs text-slate-400">Gebuzzert von: <span className="font-bold text-white">{buzzerWinner}</span></div>
                <div className="flex justify-center gap-2 text-xs">
                  <button
                    onClick={() => { changeScore(buzzerWinnerId, activeQuestion.points); handleCloseQuestion(); }}
                    className="bg-slate-200 hover:bg-white text-slate-950 font-semibold px-4 py-1.5 rounded transition"
                  >
                    Richtig
                  </button>
                  <button
                    onClick={handleWrongAnswer}
                    className="border border-slate-800 hover:bg-slate-850 text-slate-400 px-4 py-1.5 rounded transition"
                  >
                    Falsch
                  </button>
                </div>
              </div>
            )}

            {!buzzerWinner && (
              <button onClick={handleCloseQuestion} className="text-xs text-slate-500 hover:text-slate-400 block mx-auto pt-2">Frage überspringen</button>
            )}
          </div>
        )}
      </div>
    );
  }

  /* --- DESKTOP SPIELER VIEW --- */
  const myScore = players.find(p => p.name === playerName)?.score || 0;
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="p-6 max-w-[95vw] mx-auto flex flex-col justify-between min-h-screen bg-slate-950 text-slate-300 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Spieler</span>
          <div className="text-sm font-semibold text-white">{playerName}</div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Dein Score</span>
          <div className="font-mono text-base font-bold text-amber-400">{myScore} Pkt</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch my-auto w-full">
        <div className="lg:col-span-2 bg-slate-900/20 border border-slate-900 p-4 rounded-xl flex flex-col justify-center">
          <p className="text-left text-[10px] text-slate-500 tracking-widest uppercase mb-3 font-medium">Aktueller Board-Status</p>
          <RenderBoard isInteractive={false} />
        </div>

        <div className="space-y-6 flex flex-col justify-between">
          <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3">
            <p className="text-left text-[10px] text-slate-500 tracking-widest uppercase font-medium border-b border-slate-850 pb-2">
              🏆 Live-Rangliste ({players.length} Spieler)
            </p>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {sortedPlayers.map((p, idx) => {
                const isMe = p.name === playerName;
                return (
                  <div
                    key={p.id}
                    className={`flex justify-between items-center text-xs px-2.5 py-1.5 rounded-md ${isMe ? 'bg-slate-800/60 border border-slate-700/50 text-white' : 'bg-slate-950/40 text-slate-400'}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-mono font-bold text-slate-600 w-4">{idx + 1}.</span>
                      <span className={`truncate ${isMe ? 'font-bold text-amber-400' : ''}`}>{p.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-200">{p.score} Pkt</span>
                  </div>
                );
              })}
              {players.length === 0 && (
                <div className="text-center text-xs text-slate-600 py-2">Noch keine Spieler im Raum</div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl flex flex-col justify-between items-center text-center flex-1 min-h-[350px]">
            <div className="w-full space-y-3">
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block border-b border-slate-850 pb-2">
                {activeQuestion ? `${activeQuestion.category} · ${activeQuestion.points} Pkt` : 'Warten auf Auswahl'}
              </span>

              <div className="min-h-[100px] flex items-center justify-center px-2">
                {activeQuestion ? (
                  questionRevealedForPlayers ? (
                    <div className="text-base font-medium text-white leading-relaxed">"{activeQuestion.text}"</div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">Der Host liest die Frage vor oder spielt Medien ab...</div>
                  )
                ) : (
                  <div className="text-xs text-slate-600">Sobald der Host eine Frage öffnet, erscheint sie hier.</div>
                )}
              </div>
              {activeQuestion && <MediaRenderer type={activeQuestion.mediaType} url={activeQuestion.mediaUrl} />}
            </div>

            <div className="py-4">
              <button
                onClick={() => { if (buzzerActive) socket.emit('press_buzzer', roomCode); }}
                disabled={!buzzerActive}
                className={`w-36 h-36 rounded-full font-semibold text-xs tracking-wider transition-all border transform active:scale-95 shadow-md ${buzzerActive
                    ? 'bg-slate-100 border-white text-slate-950 shadow-slate-100/10 cursor-pointer hover:bg-white'
                    : 'bg-slate-950 border-slate-850 text-slate-700 cursor-not-allowed'
                  }`}
              >
                {buzzerWinner ? buzzerWinner : 'BUZZER'}
              </button>
            </div>

            <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
              {statusMessage}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-[9px] text-slate-700 font-mono">
        Jeopardy Live Client OS v2.4
      </div>
    </div>
  );
}

export default App;