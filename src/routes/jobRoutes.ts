import { Router } from "express";
import multer from "multer";

import {
  createJob,
  getAllJobs,
  getJobById,
  searchJob,
  uploadResume,
  applyForJob,
} from "../controllers/jobController";
import { hasRole, isAuthenticated } from "../middlewares/authMiddlewares";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.post("/", isAuthenticated, hasRole("Admin"), createJob);
router.get("/", isAuthenticated, getAllJobs);
router.get("/search", isAuthenticated, searchJob);
router.post("/upload", isAuthenticated, upload.single("resume"), uploadResume);
router.post("/apply/:jobId", isAuthenticated, applyForJob);
router.get("/:id", isAuthenticated, getJobById);

export default router;
