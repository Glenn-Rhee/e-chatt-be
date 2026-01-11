import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRoutes } from "../router/user-routes.js";
import { notFound } from "../middleware/notFound.js";

const app = express();
const PORT = 8001 as const;

app.use(
  cors({
    origin: ["http:/localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(userRoutes);

// Middleware
app.use(notFound);
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
