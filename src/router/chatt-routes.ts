import { Router } from "express";
import ChattController from "../controller/chatt-controller.js";

export const chattRoutes = Router();

chattRoutes.post("/chatt", ChattController.postChatt);
