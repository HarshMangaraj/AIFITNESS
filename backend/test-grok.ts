import dotenv from "dotenv";
dotenv.config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_VISION_MODEL = "llama-3.2-11b-vision-preview";

import fs from "fs";
async function test() {
  const response = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${process.env.GROK_API_KEY}` }
  });
  const data = await response.json();
  fs.writeFileSync("models.txt", data.data.map((m: any) => m.id).join("\\n"));
}
test();
