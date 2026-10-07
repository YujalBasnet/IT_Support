import express from "express";

const router = express.Router();

router.get("/google", (req, res) => {
  res.send("Google login route is working");
});

export default router;