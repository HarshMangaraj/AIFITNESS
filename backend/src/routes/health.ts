import { Router, type IRouter, Request, Response } from "express";
import { HealthCheckResponse } from "@/api-zod";
import { db } from "@/db";

const router: IRouter = Router();

router.get("/healthz", (_req: Request, res: Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
