import { Router, Request, Response } from "express";
import { analyzeFoodImage } from "../lib/grok.js";

const router = Router();

router.post("/scan", async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Handle base64 image (remove prefix if present)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    
    const nutritionInfo = await analyzeFoodImage(base64Data);
    
    return res.json(nutritionInfo);
  } catch (error: any) {
    console.error("Food scan error:", error);
    return res.status(500).json({ message: error.message || "Failed to analyze food image" });
  }
});

export default router;
