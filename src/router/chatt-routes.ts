import { Router } from "express";
import ChattController from "../controller/chatt-controller.js";
import { userMiddleware } from "../middleware/user-middleware.js";

export const chattRoutes = Router();

chattRoutes.post("/chatt", userMiddleware, ChattController.postChatt);
chattRoutes.get("/chatts", userMiddleware, ChattController.getChatts);
chattRoutes.post(
  "/conversation",
  userMiddleware,
  ChattController.createConversation,
);
chattRoutes.get("/message", userMiddleware, ChattController.getMessage);
