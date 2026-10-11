import { fileTypeFromFile } from "file-type";
import fs from "fs/promises";
import path from "path";

const allowedTypes = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".gif": ["image/gif"],
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const validateAttachment = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Please select a file to upload",
    });
  }

  try {
    const extension = path.extname(
      req.file.originalname
    ).toLowerCase();

    // Plain text files do not have a reliable binary signature.
    if (extension === ".txt") {
      const content = await fs.readFile(req.file.path);

      // Reject binary-like content, including null bytes.
      if (content.includes(0)) {
        await fs.unlink(req.file.path);
        return res.status(400).json({
          message: "Invalid text file content",
        });
      }

      return next();
    }

    const detected = await fileTypeFromFile(req.file.path);
    console.log("FILE VALIDATION:", {
  filename: req.file.originalname,
  detectedType: detected?.mime ?? "unknown",
});

    if (
      !detected ||
      !allowedTypes[extension]?.includes(detected.mime)
    ) {
      await fs.unlink(req.file.path).catch((error) => {
  if (error.code !== "ENOENT") {
    throw error;
  }
});
      
if (
  !detected ||
  !allowedTypes[extension]?.includes(detected.mime)
) {
  console.log("Invalid file; deleting:", req.file.path);

  await fs.unlink(req.file.path).catch((error) => {
  if (error.code !== "ENOENT") {
    throw error;
  }
});

  console.log("Invalid file deleted successfully");

  return res.status(400).json({
    message: "File content does not match its extension",
  });
}


      return res.status(400).json({
        message: "File content does not match its extension",
      });
    }

    // Use the detected MIME type for database metadata.
    req.file.mimetype = detected.mime;

    next();
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    next(error);
  }
};