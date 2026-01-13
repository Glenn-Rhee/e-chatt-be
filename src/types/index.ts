import type { Request } from "express";
import jwt from "jsonwebtoken";

export interface ResponsePayload<T = unknown> {
  code: number;
  status: "success" | "failed";
  message: string;
  data: T;
}

export interface RequestUser extends Request {
  email?: string;
}

export interface JwtDecoded extends jwt.JwtPayload {
  email: string;
  username: string;
}
