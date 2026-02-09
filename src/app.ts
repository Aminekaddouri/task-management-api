import express, { Application } from "express";
import cors from "cors";
import config from "./config";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// Create Express app
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(`/api/${config.apiVersion}`, routes);

// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;