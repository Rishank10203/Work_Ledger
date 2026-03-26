import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";

// Route Imports
import userRoutes from "./routes/userRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import timeEntryRoutes from "./routes/timeEntryRoutes.js";
import subTaskRoutes from "./routes/subTaskRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();
const PORT = process.env.PORT || 5099;
const __dirname = path.resolve();

// Initialize Database
connectDB();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Global Database Guard: Prevent requests from hanging if DB is offline
app.use((req, res, next) => {
  if (
    mongoose.connection.readyState !== 1 &&
    !req.path.startsWith("/api/health") &&
    req.path !== "/"
  ) {
    return res.status(503).json({
      success: false,
      message:
        "Database is currently disconnected. Please starting your local MongoDB service or check connection string.",
      status: "offline",
    });
  }
  next();
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/time", timeEntryRoutes);
app.use("/api/subtasks", subTaskRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    dbState:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, "../client/dist")));

// React wildcard — serve index.html for all non-API routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

// Error handling — MUST be last
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`),
);
