
import database from "../database/database.js";
import { createAuditLog } from "../services/auditLogService.js";

const db = database.promise();

const validId = (value) =>
  /^[1-9]\d*$/.test(String(value)) &&
  Number.isSafeInteger(Number(value));

// GET /categories
export const getCategories = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT id, name, description, is_active,
             created_at, updated_at
      FROM categories
      ORDER BY name ASC
    `);

    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      message: "Failed to retrieve categories",
    });
  }
};

// POST /categories

export const createCategory = async (req, res) => {
  try {
    const { name, description = null } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        message: "Category name must be 1-100 characters",
      });
    }

    if (
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "Description must be a string or null",
      });
    }

    const cleanName = name.trim();
    const cleanDescription = description?.trim() || null;

    // 1. Create category
    const [result] = await db.query(
      `INSERT INTO categories (name, description)
       VALUES (?, ?)`,
      [cleanName, cleanDescription]
    );

    // 2. Record admin audit log
    const auditLogId = await createAuditLog({
      userId: Number(req.user.userId),
      action: "CATEGORY_CREATED",
      resourceType: "category",
      resourceId: result.insertId,
      changes: {
        name: cleanName,
        description: cleanDescription,
      },
    });

    if (auditLogId === null) {
      console.warn(
        "Category created, but audit logging failed:",
        result.insertId
      );
    }

    // 3. Return success
    return res.status(201).json({
      message: "Category created successfully",
      categoryId: result.insertId,
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    console.error("Create category error:", error);

    return res.status(500).json({
      message: "Failed to create category",
    });
  }
};


// PATCH /categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!validId(id)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    if (name === undefined && description === undefined) {
      return res.status(400).json({
        message: "Provide name or description to update",
      });
    }

    if (
      name !== undefined &&
      (
        typeof name !== "string" ||
        !name.trim() ||
        name.trim().length > 100
      )
    ) {
      return res.status(400).json({
        message: "Category name must be 1-100 characters",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid description",
      });
    }

    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name.trim());
    }

    if (description !== undefined) {
      fields.push("description = ?");
      values.push(
        description === null ? null : description.trim()
      );
    }

    values.push(Number(id));

    const [result] = await db.query(
      `UPDATE categories
       SET ${fields.join(", ")}
       WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category updated successfully",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Category name already exists",
      });
    }

    console.error("Update category error:", error);
    return res.status(500).json({
      message: "Failed to update category",
    });
  }
};

// PATCH /categories/:id/status
export const updateCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (!validId(id)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        message: "is_active must be true or false",
      });
    }

    const [result] = await db.query(
      `UPDATE categories
       SET is_active = ?
       WHERE id = ?`,
      [is_active ? 1 : 0, Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: is_active
        ? "Category enabled successfully"
        : "Category disabled successfully",
    });
  } catch (error) {
    console.error("Update category status error:", error);
    return res.status(500).json({
      message: "Failed to update category status",
    });
  }
};

// DELETE /categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    const [result] = await db.query(
      "DELETE FROM categories WHERE id = ?",
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        message:
          "Cannot delete a category used by existing tickets. Disable it instead.",
      });
    }

    console.error("Delete category error:", error);
    return res.status(500).json({
      message: "Failed to delete category",
    });
  }
};
