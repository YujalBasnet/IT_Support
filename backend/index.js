import express from "express";
import cors from "cors";
import "dotenv/config";
import database from "./database/database.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());



app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Todo Backend is running...");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});