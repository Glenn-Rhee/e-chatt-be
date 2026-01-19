import type { NextFunction, Response } from "express";
import type { RequestUser } from "../types/index.js";
import ResponseError from "../error/Response-Error.js";
import FriendService from "../service/friend-service.js";
import Validation from "../validation/validation.js";
import FriendValidation from "../validation/friend-validation.js";

export default class FriendController {
  static async findUser(req: RequestUser, res: Response, next: NextFunction) {
    try {
      const email = req.email;
      if (!email) {
        throw new ResponseError(403, "Unthorized! Login first!");
      }
      const username = req.query.username;
      if (!username) {
        throw new ResponseError(400, "Please fill username query!");
      }

      const response = await FriendService.findUser(username as string, email);
      return res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async addFriend(req: RequestUser, res: Response, next: NextFunction) {
    try {
      const email = req.email;
      if (!email) {
        throw new ResponseError(403, "Unthorized! Login first!");
      }

      const data = Validation.validate(FriendValidation.ADDFRIEND, req.body);
      const response = await FriendService.addFriend(data.receiverId, email);
      return res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async actionFriend(
    req: RequestUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const email = req.email;
      if (!email) {
        throw new ResponseError(403, "Unthorized! Login first!");
      }

      const data = Validation.validate(FriendValidation.ACTIONFRIEND, req.body);
      const response = await FriendService.actionFriend(data, email);
      return res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
