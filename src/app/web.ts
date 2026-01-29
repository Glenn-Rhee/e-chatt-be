import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRoutes } from "../router/user-routes.js";
import { notFound } from "../middleware/notFound.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import morgan from "morgan";
import { chattRoutes } from "../router/chatt-routes.js";
import { friendRoutes } from "../router/friend-routes.js";
import http from "http";
import { initSocket } from "../lib/socket.js";
import { setupSocketHandlers } from "../lib/socket-handler.js";
import UserService, { lastPing } from "../service/user-service.js";

const app = express();
const PORT = 8001 as const;
const server = http.createServer(app);
const io = initSocket(server);
setupSocketHandlers(io);
io.on("connection", (socket) => {
  socket.on("conversation:join", (convId) => {
    socket.join(`conversation:${convId}`);
  });
  socket.on("conversation:leave", (convId) => {
    socket.leave(`conversation:${convId}`);
  });

  socket.on("user:online", async (userId: string) => {
    await UserService.HanldeUserOnline(userId, socket, io);
  });

  socket.on("user:ping", () => {
    lastPing.set(socket.id, Date.now());
  });

  socket.on("disconnect", async () => {
    await UserService.HanldeUserOffline(socket, io);
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [socketId, time] of lastPing.entries()) {
    if (now - time > 15000) {
      const socket = io.sockets.sockets.get(socketId);
      socket?.disconnect(true);
    }
  }
}, 5_000);

server.listen(8001, () => {
  console.log("Socket server running on http:/localhost:8001");
});

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(morgan(":method :url :status :response-time ms"));

// Routes
app.use(userRoutes);
app.use(chattRoutes);
app.use(friendRoutes);

// Middleware
app.use(notFound);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
