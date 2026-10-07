import jwt from "jsonwebtoken";

export const isLoggedIn = (req, res, next) => {

  console.log("AUTHORIZATION HEADER:", req.headers.authorization);
  const token = req?.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token is required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};