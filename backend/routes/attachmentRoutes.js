
// routes/attachmentRoutes.js
import express from "express";
import upload from "../middleware/multerconfig.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";
import { uploadAttachment } from "../controllers/attachmentController.js";

const router = express.Router();

router.post(
  "/tickets/:id/attachments",
  isLoggedIn,
  upload.single("file"),
  uploadAttachment
);

export default router;
