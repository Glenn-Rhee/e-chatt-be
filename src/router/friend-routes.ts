import { Router } from "express";
import { userMiddleware } from "../middleware/user-middleware.js";
import FriendController from "../controller/friend-controller.js";

export const friendRoutes = Router();

friendRoutes.get("/friend", userMiddleware, FriendController.findUser);
