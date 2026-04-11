import express from "express";
import { prisma } from "../backend/src/lib/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../backend/src/lib/auth.js";
import { generateWorkoutPlan } from "../backend/src/lib/grok.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/api/workout/generate", requireAuth, async (req: AuthenticatedRequest, res) => {
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

app.get("/api/workout/plans", requireAuth, async (req: AuthenticatedRequest, res) => {
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

app.get("/api/workout/plans/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
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
