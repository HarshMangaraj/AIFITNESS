import express from "express";
import { analyzeFoodImage } from "../backend/src/lib/grok.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/api/food/scan", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: "Image is required" });

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const nutritionInfo = await analyzeFoodImage(base64Data);
    
    return res.json(nutritionInfo);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to analyze food image" });
  }
});

export default app;
