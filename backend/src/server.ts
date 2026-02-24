import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket/socketHandler";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

const PORT = 3000;

app.use(express.json());

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});