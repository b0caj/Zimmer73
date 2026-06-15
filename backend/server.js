const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const BACKEND_URL = process.env.NODE_ENV === 'production'
    ? 'DEINE_RENDER_BACKEND_URL_HIER_EINSETZEN'
    : 'http://localhost:3001';

const socket = io(BACKEND_URL);

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const games = {};

io.on('connection', (socket) => {
    console.log(`User verbunden: ${socket.id}`);

    // 1. Raum erstellen (Host lädt auch sein initiales Board hoch)
    socket.on('create_room', ({ roomCode, board }) => {
        games[roomCode] = {
            hostId: socket.id,
            players: [],
            buzzedPlayer: null,
            locked: false,
            // Hier speichern wir den Live-Zustand des Spiels für die Spieler
            board: board,
            activeQuestion: null,
            playedQuestions: []
        };
        socket.join(roomCode);
        console.log(`Raum ${roomCode} mit Board erstellt.`);
        socket.emit('room_created', { success: true });
    });

    // 2. Raum beitreten (Spieler bekommt sofort den aktuellen Spielzustand)
    socket.on('join_room', ({ roomCode, playerName }) => {
        if (!games[roomCode]) {
            return socket.emit('error_message', 'Raum existiert nicht!');
        }

        const newPlayer = { id: socket.id, name: playerName, score: 0 };
        games[roomCode].players.push(newPlayer);

        socket.join(roomCode);

        // Dem Spieler direkt das aktuelle Board spiegeln
        socket.emit('joined_successfully', {
            roomCode,
            board: games[roomCode].board,
            activeQuestion: games[roomCode].activeQuestion,
            playedQuestions: games[roomCode].playedQuestions
        });

        io.to(roomCode).emit('update_players', games[roomCode].players);
    });

    // 3. Host wählt eine Frage aus
    socket.on('host_select_question', ({ roomCode, categoryName, question }) => {
        const game = games[roomCode];
        if (game) {
            game.activeQuestion = { ...question, category: categoryName };
            game.buzzedPlayer = null;
            game.locked = true; // Komplett gesperrt

            io.to(roomCode).emit('sync_question_opened', game.activeQuestion);
        }
    });

    // NEU: 3.5 Nur den Text für Spieler aufdecken, Buzzer bleibt gesperrt
    socket.on('host_reveal_text', (roomCode) => {
        io.to(roomCode).emit('sync_text_revealed');
    });

    // 4. Eine Frage wird zum Buzzern freigegeben
    socket.on('activate_question', (roomCode) => {
        const game = games[roomCode];
        if (game) {
            game.buzzedPlayer = null;
            game.locked = false;
            io.to(roomCode).emit('question_active');
        }
    });

    // 5. DER BUZZER
    socket.on('press_buzzer', (roomCode) => {
        const game = games[roomCode];
        if (!game || game.locked || game.buzzedPlayer !== null) return;

        game.locked = true;
        game.buzzedPlayer = socket.id;
        const player = game.players.find(p => p.id === socket.id);

        io.to(roomCode).emit('player_buzzed', {
            playerId: socket.id,
            playerName: player ? player.name : 'Jemand'
        });
    });

    // 6. Antwort war falsch
    socket.on('wrong_answer', (roomCode) => {
        const game = games[roomCode];
        if (game) {
            game.buzzedPlayer = null;
            game.locked = false;
            io.to(roomCode).emit('question_active');
        }
    });

    // 7. Host schließt die Frage -> Zurück zum Board für alle
    socket.on('host_close_question', (roomCode) => {
        const game = games[roomCode];
        if (game && game.activeQuestion) {
            const qKey = `${game.activeQuestion.category}-${game.activeQuestion.points}`;
            if (!game.playedQuestions.includes(qKey)) {
                game.playedQuestions.push(qKey);
            }
            game.activeQuestion = null;

            io.to(roomCode).emit('sync_question_closed', game.playedQuestions);
        }
    });

    // 8. Punkte live aktualisieren
    socket.on('update_score', ({ roomCode, playerId, pointsChange }) => {
        const game = games[roomCode];
        if (game) {
            const player = game.players.find(p => p.id === playerId);
            if (player) {
                player.score += pointsChange;
                io.to(roomCode).emit('update_players', game.players);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`User getrennt: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});