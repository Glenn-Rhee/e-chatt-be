import Express from "express";
import UserController from "../controller/user-controller.js";
export const userRoutes = Express.Router();

userRoutes.post("/user", UserController.CreateUser);
userRoutes.get("/user", UserController)
