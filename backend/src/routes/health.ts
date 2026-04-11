import { Router, type IRouter, Request, Response } from "express";
import { HealthCheckResponse } from "../api-zod/index.js";
import { db } from "../db/index.js";

const router: IRouter = Router();

router.get("/healthz", (_req: Request, res: Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
