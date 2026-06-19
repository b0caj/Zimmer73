import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { initialBoard } from './questions';
import JeopardyBuilder from './JeopardyBuilder';
import { supabase } from './supabaseClient';
import PlayerScreen from './player/PlayerScreen';
import HostScreen from './host/HostScreen';
import StartMenu from './ui/StartMenu';
import { getSfxUrl, playSfx } from './audio/sfx';



// Tausche localhost gegen deine Render-Backend-URL aus, sobald du sie hast!
const socket = io('http://localhost:3001'); io('https://projekt73.onrender.com');



function App() {
  const [role, setRole] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joined, setJoined] = useState(false);
  const [audioAction, setAudioAction] = useState({ type: null, timestamp: Date.now() });
  const [players, setPlayers] = useState([]);

  const [board, setBoard] = useState(initialBoard);


  const [activeQuestion, setActiveQuestion] = useState(null);
  void activeQuestion;

  const [playedQuestions, setPlayedQuestions] = useState([]);
  void playedQuestions;

  const [questionRevealedForPlayers, setQuestionRevealedForPlayers] = useState(false);
  void questionRevealedForPlayers;

  const [mediaRevealedForPlayers, setMediaRevealedForPlayers] = useState(false);
  void mediaRevealedForPlayers;



  // States für Supabase
  const [supabaseBoards, setSupabaseBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState('');

  // Weitere Spiel-States
  const [buzzerActive, setBuzzerActive] = useState(false);
  void buzzerActive;

  const [buzzerWinner, setBuzzerWinner] = useState(null);
  void buzzerWinner;

  const [statusMessage, setStatusMessage] = useState('Warte auf Spielstart...');
  void statusMessage;


  // 1. Boards beim Laden der App sicher aus Supabase abrufen
  useEffect(() => {
    const fetchSupabaseBoards = async () => {
      try {
        const { data, error } = await supabase
          .from('boards')
          .select('id, title, categories');

        if (error) throw error;
        if (data) setSupabaseBoards(data);
      } catch (err) {
        console.error("Fehler beim Laden der Supabase-Boards:", err.message);
      }
    };
    fetchSupabaseBoards();
  }, []);

  // Socket-Verbindungen (Backend Event Names)
  useEffect(() => {
    socket.on('room_created', () => {
      // Backend sendet: { success: true }
      setJoined(true);
    });


    socket.on('joined_successfully', ({ board, activeQuestion, playedQuestions }) => {
      if (board) setBoard(board);
      setActiveQuestion(activeQuestion);
      setPlayedQuestions(playedQuestions || []);
      setJoined(true);
    });

    socket.on('update_players', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('sync_question_opened', (q) => {
      console.log('[PLAYER] sync_question_opened q=', q);
      console.log('[PLAYER] sync_question_opened mediaType/mediaUrl=', q?.mediaType, q?.mediaUrl);
      setActiveQuestion(q);
      setQuestionRevealedForPlayers(false);
      setMediaRevealedForPlayers(false);
      // Host hat neue Frage geöffnet -> letzter Buzzed-Status aus der Score-Ändern-Area entfernen
      setBuzzerActive(true);
      setBuzzerWinner(null);
      setStatusMessage('Frage geöffnet. Buzzern ist sofort erlaubt!');
    });

    socket.on('sync_text_revealed', () => {

      setQuestionRevealedForPlayers(true);
      setStatusMessage('Text offen. Buzzer ist noch gesperrt...');
    });

    socket.on('sync_media_revealed', () => {
      console.log('[PLAYER] sync_media_revealed. activeQuestion currently=', activeQuestion);
      setMediaRevealedForPlayers(true);
      setStatusMessage('Medien offen. Buzzer ist noch gesperrt...');
    });

    socket.on('sync_audio_play', ({ serverTime } = {}) => {
      setAudioAction({ type: 'play', serverTime: serverTime ?? Date.now() });
    });

    socket.on('sync_audio_pause', ({ serverTime } = {}) => {
      setAudioAction({ type: 'pause', serverTime: serverTime ?? Date.now() });
    });

    socket.on('sync_audio_stop', ({ serverTime } = {}) => {
      setAudioAction({ type: 'stop', serverTime: serverTime ?? Date.now() });
    });


    socket.on('question_active', () => {
      // Host hat den Buzzer freigegeben/resetet -> Buzzed-Status sofort löschen
      setBuzzerActive(true);
      setBuzzerWinner(null);
      setStatusMessage('Buzzing erlaubt!');
    });

    socket.on('player_buzzed', ({ playerId, playerName }) => {
      setBuzzerWinner({ playerId, playerName });
      setBuzzerActive(false);
      setStatusMessage(`${playerName} buzzed.`);
    });

    socket.on('play_sfx', ({ sfx } = {}) => {
      const url = getSfxUrl(sfx);
      playSfx(url);
    });



    socket.on('sync_question_closed', (playedQs) => {
      setActiveQuestion(null);
      setPlayedQuestions(playedQs || []);
      setQuestionRevealedForPlayers(false);
      setMediaRevealedForPlayers(false);
      setBuzzerActive(false);
      setBuzzerWinner(null);
      setAudioAction({ type: 'stop', timestamp: Date.now() });
      setStatusMessage('Nächste Frage...');
    });

    return () => {
      socket.off('room_created');
      socket.off('joined_successfully');
      socket.off('update_players');
      socket.off('sync_question_opened');
      socket.off('sync_text_revealed');
      socket.off('sync_media_revealed');
      socket.off('question_active');
      socket.off('player_buzzed');
      socket.off('play_sfx');
      socket.off('sync_question_closed');
    };
  }, []);



  // 2. Funktion zum Hosten mit dem ausgewählten Board abändern
  const generateRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

  const handleCreateHost = () => {
    let finalBoard = initialBoard;


    // Suchen, ob der Nutzer ein geladenes Board ausgewählt hat
    if (selectedBoardId) {
      const found = supabaseBoards.find(b => b.id.toString() === selectedBoardId.toString());
      if (found && found.categories) {
        // Verpackt das geladene Grid in die Struktur, die dein Spiel erwartet
        finalBoard = {
          title: found.title,
          categories: found.categories
        };
      }
    }

    const newRoomCode = generateRoomCode();
    setRoomCode(newRoomCode);

    setBoard(finalBoard);
    setRole('host');
    socket.emit('create_room', { roomCode: newRoomCode, board: finalBoard });
  };

  const handleJoinPlayer = () => {
    if (!roomCode || !playerName) return alert('Bitte Raumcode und Name eingeben!');
    setRole('player');
    socket.emit('join_room', { roomCode, playerName });
  };

  // ... (Gekürzte Event-Handler für Spiellogik wie select_question, press_buzzer etc. aus deinem Originalcode) ...

  if (role === 'builder') {
    return <JeopardyBuilder onBack={() => setRole(null)} />;
  }

  if (role === 'player' && joined) {
    return (
      <div className="relative min-h-screen font-sans">
        {/* General overlay / dim layer across full viewport width */}
        <div className="fixed inset-0 w-screen bg-slate-950/40 pointer-events-none" />

        {/* Content stays centered, overlay is not constrained by max-w */}
        <div className="relative p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-300 min-h-screen">
          <PlayerScreen
            playerName={playerName}
            statusMessage={statusMessage}
            players={players}
            buzzerWinner={buzzerWinner}
            board={board}
            playedQuestions={playedQuestions}
            activeQuestion={activeQuestion}
            questionRevealedForPlayers={questionRevealedForPlayers}
            mediaRevealedForPlayers={mediaRevealedForPlayers}
            buzzerActive={buzzerActive}
            roomCode={roomCode}
            onBuzz={(roomCode) => socket.emit('press_buzzer', roomCode)}
            audioAction={audioAction}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans">
      {/* General overlay / dim layer across full viewport width */}
      <div className="fixed inset-0 w-screen bg-slate-950/40 pointer-events-none" />

      <div className="relative p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-300 min-h-screen">
        {!role && (
          <StartMenu
            supabaseBoards={supabaseBoards}
            selectedBoardId={selectedBoardId}
            setSelectedBoardId={setSelectedBoardId}
            roomCode={roomCode}
            setRoomCode={setRoomCode}
            playerName={playerName}
            setPlayerName={setPlayerName}
            handleCreateHost={handleCreateHost}
            handleJoinPlayer={handleJoinPlayer}
            audioAction={audioAction}
            onOpenBuilder={() => setRole('builder')}
          />
        )}

        {role === 'host' && joined && (
          <HostScreen
            board={board}
            playedQuestions={playedQuestions}
            activeQuestion={activeQuestion}
            players={players}
            buzzerWinner={buzzerWinner}
            questionRevealedForPlayers={questionRevealedForPlayers}
            statusMessage={statusMessage}
            roomCode={roomCode}
            socket={socket}
          />
        )}
      </div>
    </div>
  );
}


export default App;