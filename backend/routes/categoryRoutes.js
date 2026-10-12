
import express from "express";

import {
  getCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from "../controllers/categoryController.js";

import {
  isLoggedIn,
  isAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", isLoggedIn, getCategories);

router.post("/", isLoggedIn, isAdmin, createCategory);

router.patch("/:id", isLoggedIn, isAdmin, updateCategory);

router.patch(
  "/:id/status",
  isLoggedIn,
  isAdmin,
  updateCategoryStatus
);

router.delete("/:id", isLoggedIn, isAdmin, deleteCategory);

export default router;
