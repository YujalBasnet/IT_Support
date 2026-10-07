import jwt from "jsonwebtoken";

export const isLoggedIn = (req, res, next) => {

  // console.log("AUTHORIZATION HEADER:", req.headers.authorization);
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
export const isAdmin = (req, res, next) => {
  if (req.user.roleId === 3) {
    next();
  } else {
    return res.status(403).json({
      message: "Admin access required",
    });
  }
};

export const isSupportAgent = (req, res, next) => {
  if (req.user.roleId === 2) {
    next();
  } else {
    return res.status(403).json({
      message: "Support agent access required",
    });
  }
};

export const isEmployee = (req, res, next) => {
  if (req.user.roleId === 1) {
    next();
  } else {
    return res.status(403).json({
      message: "Employee access required",
    });
  }
};