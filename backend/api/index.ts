// This is the Vercel serverless entry point.
// It imports the Express app and exports it as the default handler.
// Vercel's @vercel/node runtime wraps this in a serverless function.
import "../src/env.js";
import app from "../src/app.js";

export default app;
