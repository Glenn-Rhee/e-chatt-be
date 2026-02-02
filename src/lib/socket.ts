import { Server } from "socket.io";
import http from "http";
import ResponseError from "../error/Response-Error.js";
let io: Server;

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new ResponseError(500, "Internal server socket is error!");
  }

  return io;
}
