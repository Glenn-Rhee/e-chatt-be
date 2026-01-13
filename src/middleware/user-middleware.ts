import type { NextFunction, Response } from "express";
import ResponseError from "../error/Response-Error.js";
import type {
  JwtDecoded,
  RequestUser,
  ResponsePayload,
} from "../types/index.js";
import jwt from "jsonwebtoken";
import JWT from "../lib/jwt.js";
import Encryption from "../lib/encryption.js";

export const userMiddleware = (
  req: RequestUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"];
    if (typeof token !== "string") {
      throw new ResponseError(403, "Forbidden! Token is required!");
    }

    const tokenDecrypt = Encryption.decrypt(token);

    const decoded = JWT.verify(tokenDecrypt) as JwtDecoded;
    req.email = decoded.email;
    next();
  } catch (error) {
    if (error instanceof ResponseError) {
      const response: ResponsePayload = {
        code: error.status,
        data: null,
        message: error.message,
        status: "failed",
      };
      return res.status(error.status).json(response);
    } else if (error instanceof jwt.TokenExpiredError) {
      const response: ResponsePayload = {
        code: 401,
        data: null,
        message: "Oops! Token is expired, please login again!",
        status: "failed",
      };

      return res.status(response.code).json(response);
    } else if (error instanceof jwt.JsonWebTokenError) {
      const response: ResponsePayload = {
        code: 401,
        data: null,
        message: "Invalid authentication token.",
        status: "failed",
      };

      return res.status(response.code).json(response);
    } else {
      console.log(error);
      const response: ResponsePayload = {
        code: 500,
        data: null,
        message: "An error occured! Please try again later!",
        status: "failed",
      };
      return res.status(response.code).json(response);
    }
  }
};
