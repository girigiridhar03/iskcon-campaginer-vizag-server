import { response } from "../utils/response.js";

export const onlyAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only",
    });
  }

  next();
};

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!roles.includes(user.role)) {
      return response(res, 403, "Access deined: You are not authorized");
    }
    return next();
  };
};
