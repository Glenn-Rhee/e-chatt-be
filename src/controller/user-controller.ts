import type { NextFunction, Request, Response } from "express";
import UserService from "../service/user-service.js";
import type z from "zod";
import UserValidation from "../validation/user-validation.js";
import Validation from "../validation/validation.js";
import ResponseError from "../error/Response-Error.js";

export default class UserController {
  public static async CreateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = req.body as z.infer<typeof UserValidation.CREATEUSER>;
      Validation.validate(UserValidation.CREATEUSER, data);
      const response = await UserService.CreateUser(data);
      return res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  public static async GetUser(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers["Authorization"];
      if (typeof token !== "string") {
        throw new ResponseError(403, "Oops! Forbidden token is required!");
      }

      const response = await UserService.GetUser()
    } catch (error) {
      next(error);
    }
  }
}
