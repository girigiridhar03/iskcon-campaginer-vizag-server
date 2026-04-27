export const campaignerStatus = (req, res, next) => {
  req.campaignerStatus = "pending";
  req.isCampaigner = true;

  if (req.user?.role === "admin" || req?.user?.role === "devotee") {
    req.campaignerStatus = "active";
    req.isCampaigner = false;
  }

  next();
};
