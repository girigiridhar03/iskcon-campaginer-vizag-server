export const campaignerStatus = (req, res, next) => {
  req.campaignerStatus = "pending";

  if (req.user?.role === "admin") {
    req.campaignerStatus = "active";
  }

  next();
};
