import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HealthCheckResponse } from "../backend/src/api-zod/index.js";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const data = HealthCheckResponse.parse({ status: "ok" });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "internal_error", message: "Health check failed" });
  }
}
