
import { fileTypeFromFile } from "file-type";
import fs from "fs/promises";
import path from "path";

const allowedTypes = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".gif": ["image/gif"],
  ".pdf": ["application/pdf"],
};

const removeUploadedFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // The file may already have been removed.
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

export const validateAttachment = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Please select a file to upload",
    });
  }

  try {
    const extension = path
      .extname(req.file.originalname)
      .toLowerCase();

    // Basic text validation: reject files containing null bytes.
    if (extension === ".txt") {
      const content = await fs.readFile(req.file.path);

      if (content.includes(0)) {
        await removeUploadedFile(req.file.path);

        return res.status(400).json({
          message: "Invalid text file content",
        });
      }

      req.file.mimetype = "text/plain";
      return next();
    }

    const expectedTypes = allowedTypes[extension];
    const detected = await fileTypeFromFile(req.file.path);

    console.log("FILE VALIDATION:", {
      filename: req.file.originalname,
      detectedType: detected?.mime ?? "unknown",
    });

    if (
      !expectedTypes ||
      !detected ||
      !expectedTypes.includes(detected.mime)
    ) {
      await removeUploadedFile(req.file.path);

      return res.status(400).json({
        message: "File content does not match its extension",
      });
    }

    // Store the detected MIME type rather than trusting the request.
    req.file.mimetype = detected.mime;

    return next();
  } catch (error) {
    try {
      await removeUploadedFile(req.file.path);
    } catch (cleanupError) {
      console.error(
        "Attachment cleanup failed:",
        cleanupError.message
      );
    }

    return next(error);
  }
};
