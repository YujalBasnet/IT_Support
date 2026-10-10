import "dotenv/config";
import express from "express";
import cors from "cors";
import database from "./database/database.js";
import ticketsRoutes from "./routes/tickets.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import teamRoutes from "./routes/team.js";
import attachmentRoutes from "./routes/attachmentRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tickets", ticketsRoutes);
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use("/attachments", attachmentRoutes);

app.get("/", (req, res) => {
  res.send("IT Support Backend is running...");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});