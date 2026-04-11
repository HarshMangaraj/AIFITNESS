import { Router, type IRouter } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth.js";
import { generateWorkoutPlan } from "../lib/grok.js";

const router: IRouter = Router();

router.post("/generate", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userProfile, photoBase64 } = req.body as {
      userProfile?: {
        height: string;
        weight: string;
        age: number;
        activityLevel: string;
        goals: string;
        injuries?: string | null;
        allergies?: string | null;
        equipment?: string | null;
      };
      photoBase64?: string | null;
    };

    if (!userProfile) {
      res.status(400).json({ error: "bad_request", message: "userProfile is required" });
      return;
    }

    if (!userProfile.height || !userProfile.weight || !userProfile.age || !userProfile.activityLevel || !userProfile.goals) {
      res.status(400).json({
        error: "bad_request",
        message: "userProfile must include height, weight, age, activityLevel, and goals",
      });
      return;
    }

    req.log.info({ userId: req.user!.userId }, "Generating workout plan with Grok AI");

    const plan = await generateWorkoutPlan(userProfile, photoBase64);

    const workoutPlan = await prisma.workoutPlan.create({
      data: {
        userId: req.user!.userId,
        plan: plan as any,
        userProfile: userProfile as any,
      },
    });

    res.status(201).json({
      id: workoutPlan.id,
      userId: workoutPlan.userId,
      plan: workoutPlan.plan,
      userProfile: workoutPlan.userProfile,
      createdAt: workoutPlan.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Workout generation failed");
    res.status(500).json({ error: "internal_error", message: "Failed to generate workout plan" });
  }
});

router.get("/plans", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const plans = await prisma.workoutPlan.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      plans.map((p: any) => ({
        id: p.id,
        userId: p.userId,
        plan: p.plan,
        userProfile: p.userProfile,
        createdAt: p.createdAt,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Get workout plans failed");
    res.status(500).json({ error: "internal_error", message: "Failed to get workout plans" });
  }
});

router.get("/plans/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: id as string, userId: req.user!.userId },
    });

    if (!plan) {
      res.status(404).json({ error: "not_found", message: "Workout plan not found" });
      return;
    }

    res.json({
      id: plan.id,
      userId: plan.userId,
      plan: plan.plan,
      userProfile: plan.userProfile,
      createdAt: plan.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Get workout plan failed");
    res.status(500).json({ error: "internal_error", message: "Failed to get workout plan" });
  }
});

export default router;
