import type { Request, Response } from "express";
import Plan, {type IPlan } from "../models/plan.model.js";

export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, name, workoutPlan, dietPlan, isActive } = req.body as IPlan;

    const newPlan = await Plan.create({
      userId,
      name,
      workoutPlan,
      dietPlan,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: newPlan,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, message });
  }
};

export const getUserPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const plans = await Plan.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, message });
  }
};
