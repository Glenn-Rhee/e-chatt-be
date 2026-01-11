import type { NextFunction, Request, Response } from "express";
import UserService from "../service/user-service.js";

export default class UserController {
  public static async CreateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await UserService.CreateUser();
      return res.json("cihy");
    } catch (error) {
      next(error);
    }
  }
}
