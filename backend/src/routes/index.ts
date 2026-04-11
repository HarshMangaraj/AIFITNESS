import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import workoutRouter from "./workout.js";
import progressRouter from "./progress.js";
import foodRouter from "./food.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/workout", workoutRouter);
router.use("/progress", progressRouter);
router.use("/food", foodRouter);

export default router;
