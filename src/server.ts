import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import { errorHandler, notFound } from "./middlewares/errorMiddlewares";
import { isAuthenticated, hasRole } from "./middlewares/authMiddlewares";
import { CustomRequest } from "./types";

const app = express();
dotenv.config();

// middlewares
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:4200",
  })
);

// routes
app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Welcome to Job Trek</h1>");
});
app.use("/api/auth", authRoutes);
app.use("/api/job", jobRoutes);

app.use(errorHandler);
app.use(notFound);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
