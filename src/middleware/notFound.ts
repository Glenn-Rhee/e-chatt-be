import type { NextFunction, Request, Response } from "express";
import type { ResponsePayload } from "../types/index.js";

export const notFound = (_req: Request, res: Response, _n: NextFunction) => {
  const response: ResponsePayload = {
    code: 404,
    data: null,
    message: "Oops route not found",
    status: "failed",
  };
  return res.status(404).json(response);
};
