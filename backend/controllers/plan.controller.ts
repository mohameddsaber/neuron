import type { Request, Response } from "express";
import Plan, {type IPlan } from "../models/plan.model.js";
import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();
const hf = new InferenceClient(process.env.HF_TOKEN!);

export const generatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, name, payload } = req.body;

    const prompt = `
You are a professional fitness and nutrition coach.
Based on the following user profile and preferences, generate a comprehensive workout and diet plan in JSON format.

User Data:
${JSON.stringify(payload, null, 2)}

Output Requirements:
- Return ONLY valid JSON (no commentary, no markdown).
- Structure the response as:
{
  "workoutPlan": [
    { "week": 1, "days": [
      { "day": "Monday", "exercises": [ { "name": "...", "sets": 3, "reps": 10, "notes": "..." } ] },
      ...
    ] }
  ],
  "dietPlan": [
    { "week": 1, "days": [
      { "day": "Monday", "meals": [ { "meal": "Breakfast", "items": ["Oatmeal", "Eggs"], "calories": 450 } ] }
    ] }
  ]
}`;

    const response = await hf.textGeneration({
      model: "meta-llama/Llama-3-8b-instruct",
      inputs: prompt,
      parameters: { max_new_tokens: 1200, temperature: 0.7 },
    });

    let generatedText = response.generated_text.trim();

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Model response not in JSON format");

    const generated = JSON.parse(jsonMatch[0]);

    const newPlan = await Plan.create({
      userId,
      name: name || "AI-Generated Plan",
      workoutPlan: generated.workoutPlan,
      dietPlan: generated.dietPlan,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "AI plan generated successfully",
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
