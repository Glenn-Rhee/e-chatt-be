import Express from "express";
import UserController from "../controller/user-controller.js";
import { userMiddleware } from "../middleware/user-middleware.js";
export const userRoutes = Express.Router();

userRoutes.post("/user", UserController.CreateUser);
userRoutes.get("/user", userMiddleware, UserController.GetUser);
