import type { NextFunction, Request, Response } from "express";
import UserService from "../service/user-service.js";
import type z from "zod";
import UserValidation from "../validation/user-validation.js";
import Validation from "../validation/validation.js";
import type { RequestUser } from "../types/index.js";
import ResponseError from "../error/Response-Error.js";

export default class UserController {
  public static async CreateUser(
    req: Request,
    res: Response,
    next: NextFunction,
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

  public static async GetUser(
    req: RequestUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const email = req.email;
      if (!email) {
        throw new ResponseError(403, "Unathorized! Please login first!");
      }
      const response = await UserService.GetUser(email);
      return res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  public static async EditUser(
    req: RequestUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const email = req.email;
      if (!email) {
        throw new ResponseError(403, "Unathorized! Please login first!");
      }
      const data = req.body as z.infer<typeof UserValidation.EDITSCHEMA>;
      const dataUser: z.infer<typeof UserValidation.EDITSCHEMA> = {
        ...data,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
      };

      Validation.validate(UserValidation.EDITSCHEMA, dataUser);

      const response = await UserService.EditUser(data, email);
      return res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  public static async EditImage(
    req: RequestUser,
    res: Response,
    next: NextFunction,
  ) {
    console.log("PATCH /user/image");
    try {
      const email = req.email;
      if (!email) {
        throw new ResponseError(403, "Unathorized! Please login first!");
      }

      const data = req.body as z.infer<typeof UserValidation.EDITIMAGE>;
      Validation.validate(UserValidation.EDITIMAGE, data);

      const response = await UserService.EditImageUser(data, email);
      return res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
