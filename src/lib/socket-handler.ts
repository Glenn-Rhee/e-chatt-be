import type { Server } from "socket.io";
import { socketAuth } from "../middleware/socket-middleware.js";
import type { SocketUser } from "../types/index.js";
import ResponseError from "../error/Response-Error.js";
import { prisma } from "./prisma.js";

export function setupSocketHandlers(io: Server) {
  io.use(socketAuth);

  io.on("connection", async (socket: SocketUser) => {
    const user = socket.dataUser;

    if (!user) {
      throw new ResponseError(500, "An error occured at socket handlers!");
    }

    const dataUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!dataUser) {
      throw new ResponseError(500, "An error occured at socket handlers!");
    }

    socket.join(dataUser.id);
  });
}
