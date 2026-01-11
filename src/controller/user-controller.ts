import type { NextFunction, Request, Response } from "express";
import UserService from "../service/user-service.js";
import type z from "zod";
import UserValidation from "../validation/user-validation.js";
import Validation from "../validation/validation.js";

export default class UserController {
  public static async CreateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = req.body as z.infer<typeof UserValidation.CREATEUSER>;
      Validation.validate(UserValidation.CREATEUSER, data);
      const response = await UserService.CreateUser();
      return res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
