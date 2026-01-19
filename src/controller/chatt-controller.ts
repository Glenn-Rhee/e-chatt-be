import type { NextFunction, Response } from "express";
import type z from "zod";
import ChattValidation from "../validation/chatt-validation.js";
import Validation from "../validation/validation.js";
import type { RequestUser } from "../types/index.js";
import ChattService from "../service/chatt-service.js";
import ResponseError from "../error/Response-Error.js";

export default class ChattController {
  static async postChatt(req: RequestUser, res: Response, next: NextFunction) {
    try {
      const email = req.email;
      if (!email) {
        throw new ResponseError(403, "Unathorized! Login first");
      }
      const data = req.body as z.infer<typeof ChattValidation.MESSAGE>;
      Validation.validate(ChattValidation.MESSAGE, data);

      const response = await ChattService.sendMessage(data, email);
      return res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
