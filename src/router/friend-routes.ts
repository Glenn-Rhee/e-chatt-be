import { Router } from "express";
import { userMiddleware } from "../middleware/user-middleware.js";
import FriendController from "../controller/friend-controller.js";

export const friendRoutes = Router();

friendRoutes.get("/friend", userMiddleware, FriendController.findUser);
friendRoutes.post("/friend", userMiddleware, FriendController.addFriend);
friendRoutes.post(
  "/friend/actions",
  userMiddleware,
  FriendController.actionFriend,
);
friendRoutes.get(
  "/friend/actions",
  userMiddleware,
  FriendController.getFriendsAction,
);
friendRoutes.get("/friendship", userMiddleware, FriendController.getFriendship);
