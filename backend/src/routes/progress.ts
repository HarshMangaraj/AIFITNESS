import { Router, type IRouter } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth.js";
import { analyzeProgressPhoto } from "../lib/grok.js";

const router: IRouter = Router();

router.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { photoBase64, planId } = req.body as { photoBase64?: string | null; planId?: string };

    if (!photoBase64 || !planId) {
      res.status(400).json({ error: "bad_request", message: "photoBase64 and planId are required" });
      return;
    }

    req.log.info({ userId: req.user!.userId, planId }, "Analyzing progress photo for specific plan");

    // Fetch the specific workout plan to extract profile info
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: planId },
    });

    if (!workoutPlan || workoutPlan.userId !== req.user!.userId) {
      res.status(404).json({ error: "not_found", message: "Workout plan not found" });
      return;
    }

    const userProfile = workoutPlan.userProfile;
    const aiFeedback = await analyzeProgressPhoto(photoBase64, userProfile);

    const entry = await prisma.progressEntry.create({
      data: {
        userId: req.user!.userId,
        planId,
        photoBase64,
        aiFeedback,
      },
    });

    res.status(201).json({
      id: entry.id,
      userId: entry.userId,
      planId: entry.planId,
      photoBase64: entry.photoBase64,
      aiFeedback: entry.aiFeedback,
      createdAt: entry.createdAt,
    });
  } catch (err: any) {
    req.log.error({ err }, "Progress photo analysis failed");
    res.status(500).json({ error: "internal_error", message: err.message || "Failed to analyze progress photo" });
  }
});

router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { planId } = req.query as { planId?: string };

    if (!planId) {
      res.status(400).json({ error: "bad_request", message: "planId query parameter is required" });
      return;
    }

    const entries = await prisma.progressEntry.findMany({
      where: { 
        userId: req.user!.userId,
        planId: planId
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      entries.map((e) => ({
        id: e.id,
        userId: e.userId,
        planId: e.planId,
        photoBase64: e.photoBase64,
        aiFeedback: e.aiFeedback,
        createdAt: e.createdAt,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Get progress entries failed");
    res.status(500).json({ error: "internal_error", message: "Failed to get progress entries" });
  }
});

export default router;
