import mongoose, { Schema, Document, Model } from "mongoose";

interface IRoutine {
  name: string;
  sets: number;
  reps: number;
}

interface IExercise {
  day: string;
  routines: IRoutine[];
}

interface IWorkoutPlan {
  schedule: string[];
  exercises: IExercise[];
}

interface IMeal {
  name: string;
  foods: string[];
}

interface IDietPlan {
  dailyCalories: number;
  meals: IMeal[];
}

export interface IPlan extends Document {
  userId: string;
  name: string;
  workoutPlan: IWorkoutPlan;
  dietPlan: IDietPlan;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    workoutPlan: {
      schedule: [String],
      exercises: [
        {
          day: String,
          routines: [
            {
              name: String,
              sets: Number,
              reps: Number,
            },
          ],
        },
      ],
    },
    dietPlan: {
      dailyCalories: Number,
      meals: [
        {
          name: String,
          foods: [String],
        },
      ],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Plan: Model<IPlan> =
  mongoose.models.Plan || mongoose.model<IPlan>("Plan", planSchema);

export default Plan;
