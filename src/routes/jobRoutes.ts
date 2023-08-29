import { Router } from "express";

import { createJob, getAllJobs, getJobById } from "../controllers/jobController";
import { hasRole, isAuthenticated } from "../middlewares/authMiddlewares";

const router = Router();

router.post("/", isAuthenticated, hasRole("Admin"), createJob);
router.get("/", isAuthenticated, getAllJobs);
router.get("/:id", isAuthenticated, getJobById);

export default router;
