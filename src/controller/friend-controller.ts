import type { NextFunction, Response } from "express";
import type { RequestUser } from "../types/index.js";
import ResponseError from "../error/Response-Error.js";
import FriendService from "../service/friend-service.js";

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
}
