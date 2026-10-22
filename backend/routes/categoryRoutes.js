import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from "../controllers/categoryController.js";
import { isLoggedIn, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve ticket categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized.
 */
router.get("/", isLoggedIn, getCategories);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new ticket category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Database Services"
 *               description:
 *                 type: string
 *                 example: "Database provisioning, backups, and query issues"
 *     responses:
 *       201:
 *         description: Category created successfully.
 *       400:
 *         description: Category name is required.
 *       403:
 *         description: Forbidden - Admin access required.
 *       409:
 *         description: A category with this name already exists.
 */
router.post("/", isLoggedIn, isAdmin, createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: Update category name or description
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully.
 *       400:
 *         description: Invalid parameters.
 *       403:
 *         description: Forbidden - Admin access required.
 *       404:
 *         description: Category not found.
 */
router.patch("/:id", isLoggedIn, isAdmin, updateCategory);

/**
 * @swagger
 * /api/categories/{id}/status:
 *   patch:
 *     summary: Enable or disable a ticket category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_active
 *             properties:
 *               is_active:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 1
 *     responses:
 *       200:
 *         description: Category status updated successfully.
 *       400:
 *         description: Invalid status value.
 *       403:
 *         description: Forbidden - Admin access required.
 *       404:
 *         description: Category not found.
 */
router.patch("/:id/status", isLoggedIn, isAdmin, updateCategoryStatus);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category deleted successfully.
 *       403:
 *         description: Forbidden - Admin access required.
 *       404:
 *         description: Category not found.
 *       409:
 *         description: Cannot delete category assigned to existing tickets.
 */
router.delete("/:id", isLoggedIn, isAdmin, deleteCategory);

export default router;
