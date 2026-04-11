import { Router, type IRouter, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signToken, requireAuth, type AuthenticatedRequest } from "../lib/auth.js";

const router: IRouter = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "bad_request", message: "Email and password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "bad_request", message: "Password must be at least 6 characters" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "bad_request", message: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name: name ?? null },
    });

    const token = signToken({ userId: user.id, email: user.email });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    req.log.error({ err }, "Registration failed");
    res.status(500).json({ error: "internal_error", message: "Registration failed" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "bad_request", message: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    req.log.error({ err }, "Login failed");
    res.status(500).json({ error: "internal_error", message: "Login failed" });
  }
});

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }

    res.json(user);
  } catch (err: any) {
    req.log.error({ err }, "Get me failed");
    res.status(500).json({ error: "internal_error", message: "Failed to get user" });
  }
});

export default router;
