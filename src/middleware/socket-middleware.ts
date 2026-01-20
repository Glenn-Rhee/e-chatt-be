import ResponseError from "../error/Response-Error.js";
import JWT from "../lib/jwt.js";
import Encryption from "../lib/encryption.js";
import type { JwtDecoded, SocketUser } from "../types/index.js";

export function socketAuth(socket: SocketUser, next: Function) {
  try {
    const token = socket.handshake.auth.token;
    if (!token) throw new ResponseError(400, "Unathorized!");
    const tokenDecrypt = Encryption.decrypt(token);
    const payload = JWT.verify(tokenDecrypt) as JwtDecoded;

    socket.dataUser = {
      username: payload.username,
      email: payload.email,
    };
    next();
  } catch (error) {
    next(error);
  }
}
