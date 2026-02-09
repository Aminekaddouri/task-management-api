import { Router, Request, Response } from "express";
import config from "../config";
import prisma from "../config/database";
import { version } from "os";

const router = Router();

// Health check route
router.get("/health", async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "success",
      message: "Server is running!",
      timestamp: new Date().toISOString(),
      environment: config.env,
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      database: "disconnected",
    });
  }
});

// Welcome route
router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Task Management API",
    version: config.apiVersion,
    endpoints: {
      health: "/api/v1/health",
    },
  });
});

export default router;
