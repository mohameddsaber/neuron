import express, { Router } from "express";
import { createPlan, getUserPlans } from "../controllers/plan.controller.js";
import { protect } from "../middleware/auth.js";

const router: Router = express.Router();

router.post("/", protect, createPlan);
router.get("/:userId", protect, getUserPlans);

export default router;
