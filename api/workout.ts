console.log("Workout API: Modules loading...");
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import { requireAuth, type AuthenticatedRequest } from "./lib/auth";
import { generateWorkoutPlan } from "./lib/grok";

console.log("Workout API: Backend libs loaded. Initializing app...");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post(["/api/workout/generate", "/generate"], requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userProfile, photoBase64 } = req.body;
    if (!userProfile) return res.status(400).json({ error: "bad_request", message: "userProfile is required" });
    
    const plan = await generateWorkoutPlan(userProfile, photoBase64);
    const workoutPlan = await prisma.workoutPlan.create({
      data: { userId: req.user!.userId, plan: plan as any, userProfile: userProfile as any },
    });

    res.status(201).json(workoutPlan);
  } catch (err: any) {
    res.status(500).json({ error: "internal_error", message: "Failed to generate workout plan" });
  }
});

app.get(["/api/workout/plans", "/plans"], requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const plans = await prisma.workoutPlan.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(plans);
  } catch (err: any) {
    res.status(500).json({ error: "internal_error", message: "Failed to get workout plans" });
  }
});

app.get(["/api/workout/plans/:id", "/plans/:id"], requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: id as string, userId: req.user!.userId },
    });
    if (!plan) return res.status(404).json({ error: "not_found", message: "Workout plan not found" });
    res.json(plan);
  } catch (err: any) {
    res.status(500).json({ error: "internal_error", message: "Failed to get workout plan" });
  }
});

export default app;
