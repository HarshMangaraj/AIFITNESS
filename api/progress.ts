console.log("Progress API: Modules loading...");
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import { requireAuth, type AuthenticatedRequest } from "./lib/auth";
import { analyzeProgressPhoto } from "./lib/grok";

console.log("Progress API: Backend libs loaded. Initializing app...");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post(["/api/progress", "/"], requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { photoBase64, planId } = req.body;
    if (!photoBase64 || !planId) return res.status(400).json({ error: "bad_request", message: "photoBase64 and planId are required" });

    const workoutPlan = await prisma.workoutPlan.findUnique({ where: { id: planId } });
    if (!workoutPlan || workoutPlan.userId !== req.user!.userId) return res.status(404).json({ error: "not_found", message: "Workout plan not found" });

    const aiFeedback = await analyzeProgressPhoto(photoBase64, workoutPlan.userProfile);
    const entry = await prisma.progressEntry.create({
      data: { userId: req.user!.userId, planId, photoBase64, aiFeedback },
    });

    res.status(201).json(entry);
  } catch (err: any) {
    res.status(500).json({ error: "internal_error", message: err.message || "Failed to analyze progress photo" });
  }
});

app.get(["/api/progress", "/"], requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { planId } = req.query as { planId?: string };
    if (!planId) return res.status(400).json({ error: "bad_request", message: "planId query parameter is required" });

    const entries = await prisma.progressEntry.findMany({
      where: { userId: req.user!.userId, planId },
      orderBy: { createdAt: "desc" },
    });

    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: "internal_error", message: "Failed to get progress entries" });
  }
});

export default app;
