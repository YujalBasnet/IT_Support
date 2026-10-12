import "dotenv/config";
import express from "express";
import cors from "cors";
import database from "./database/database.js";

import ticketsRoutes from "./routes/tickets.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import teamRoutes from "./routes/team.js";
import attachmentRoutes from "./routes/attachmentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/auth", authRoutes);
app.use("/tickets", ticketsRoutes);
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use("/attachments", attachmentRoutes);
app.use("/categories", categoryRoutes);

app.get("/", (req, res) => {
  res.send("IT Support Backend is running...");
});

// Global error handler must be AFTER all routes
app.use(errorHandler);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});