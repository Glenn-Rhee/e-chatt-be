import type { Server } from "socket.io";
import { socketAuth } from "../middleware/socket-middleware.js";
import type { SocketUser } from "../types/index.js";
import ResponseError from "../error/Response-Error.js";

export function setupSocketHandlers(io: Server) {
  io.use(socketAuth);

  io.on("connection", (socket: SocketUser) => {
    const user = socket.dataUser;

    if (!user) {
      throw new ResponseError(500, "An error occured at socket handlers!");
    }
    socket.join(user.email);

    console.log("User connected", user.username);

    socket.on("disconnect", () => {
      console.log("User disconnected", user.username);
    });
  });
}
