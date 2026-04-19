
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Room state: roomId -> { players: { socketId: playerState } }
  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { players: {} });
      }
      
      const room = rooms.get(roomId);
      room.players[socket.id] = {
        id: socket.id,
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        health: 100,
        isAttacking: false,
        weaponType: 'NONE'
      };

      // Notify others in the room
      socket.to(roomId).emit("player-joined", room.players[socket.id]);
      
      // Send current players to the new player
      socket.emit("room-state", room.players);
      
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("check-room", (roomId, callback) => {
      const exists = rooms.has(roomId);
      callback({ exists });
    });

    socket.on("update-player", (data) => {
      const { roomId, state } = data;
      const room = rooms.get(roomId);
      if (room && room.players[socket.id]) {
        room.players[socket.id] = { ...room.players[socket.id], ...state };
        socket.to(roomId).emit("player-updated", room.players[socket.id]);
      }
    });

    socket.on("player-action", (data) => {
      const { roomId, action, payload } = data;
      socket.to(roomId).emit("remote-action", { playerId: socket.id, action, payload });
    });

    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) {
          const room = rooms.get(roomId);
          if (room) {
            delete room.players[socket.id];
            socket.to(roomId).emit("player-left", socket.id);
            
            if (Object.keys(room.players).length === 0) {
              rooms.delete(roomId);
            }
          }
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
