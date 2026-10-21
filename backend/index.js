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
import auditRoutes from "./routes/auditRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Dual mounting: /api/... (document standard) and /... (frontend backwards compatibility)
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/tickets", ticketsRoutes);
app.use("/tickets", ticketsRoutes);

app.use("/api/users", userRoutes);
app.use("/users", userRoutes);

app.use("/api/teams", teamRoutes);
app.use("/teams", teamRoutes);

app.use("/api/attachments", attachmentRoutes);
app.use("/attachments", attachmentRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/categories", categoryRoutes);

app.use("/api/audit-logs", auditRoutes);
app.use("/audit-logs", auditRoutes);

app.get("/", (req, res) => {
  res.send("IT Support Backend is running...");
});

// Global error handler must be AFTER all routes
app.use(errorHandler);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});