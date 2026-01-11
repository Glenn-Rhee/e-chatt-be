import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type { ResponsePayload } from "../types/index.js";
import ResponseError from "../error/Response-Error.js";

export const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let response: ResponsePayload;
  if (error instanceof ZodError) {
    response = {
      code: 400,
      data: null,
      message: error.issues[0]
        ? error.issues[0].message
        : "Bad request! Please fill fields properly",
      status: "failed",
    };
  } else if (error instanceof ResponseError) {
    response = {
      code: error.status,
      data: null,
      message: error.message,
      status: "failed",
    };
  } else {
    console.log(error);
    response = {
      code: 500,
      data: null,
      message: "An error occured! Please try again later",
      status: "failed",
    };
  }

  return res.status(response.code).json(response);
};
