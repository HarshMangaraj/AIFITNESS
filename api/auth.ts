console.log("Auth API: Modules loading...");
import express from "express";
import cors from "cors";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";
import { signToken, requireAuth, type AuthenticatedRequest } from "./lib/auth";

console.log("Auth API: Prisma and Auth libs loaded. Initializing app...");

const app = express();
app.use(cors());
app.use(express.json());

// Routes logic extracted from backend/src/routes/auth.ts
app.post(["/api/auth/register", "/register"], async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "bad_request", message: "Email and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "bad_request", message: "Password must be at least 6 characters" });
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "bad_request", message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hashedPassword, name: name ?? null } });
    const token = signToken({ userId: user.id, email: user.email });

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt } });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: "Registration failed" });
  }
});

app.post(["/api/auth/login", "/login"], async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "bad_request", message: "Email and password are required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt } });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: "Login failed" });
  }
});

app.get("/api/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: "not_found", message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: "Failed to get user" });
  }
});

export default app;
