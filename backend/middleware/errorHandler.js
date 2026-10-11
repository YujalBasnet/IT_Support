import multer from "multer";

export const errorHandler = (err, req, res, next) => {
  console.error("API Error:", err);

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        message: "File size exceeds the 10 MB limit",
      });
    }

    return res.status(400).json({
      message: err.message,
    });
  }

  // Handle unsupported file types
  if (err.message?.startsWith("Unsupported file type")) {
    return res.status(400).json({
      message: err.message,
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    message: "Internal server error",
  });
};