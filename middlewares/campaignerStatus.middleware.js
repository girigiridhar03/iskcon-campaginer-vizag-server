export const campaignerStatus = (req, res, next) => {
  req.campaignerStatus = "pending";

  if (req.user?.role === "admin" || req?.user?.role === "devotee") {
    req.campaignerStatus = "active";
  }

  next();
};
