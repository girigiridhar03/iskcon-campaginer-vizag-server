import express from "express";
import {
  createCampaigner,
  deleteCampaigner,
  getCampaigners,
  getLastestDonorofCampaigner,
  getSingleCampaigner,
  getTopDonors,
  updateCampaigner,
} from "../controllers/campaigner.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { optionalAuth } from "../middlewares/verifyToken.middleware.js";
import { campaignerStatus } from "../middlewares/campaignerStatus.middleware.js";

const campaignerRouter = express.Router();

campaignerRouter.post(
  "/",
  upload.single("image"),
  optionalAuth,
  campaignerStatus,
  createCampaigner,
);

// Dynamic Routes
campaignerRouter.get("/topdonors/:campaignId", getTopDonors);
campaignerRouter.get(
  "/latestDonors/:campaignId/:campaignerId",
  getLastestDonorofCampaigner,
);
campaignerRouter.get("/details/:campaignerId/", getSingleCampaigner);
campaignerRouter.get("/:campaignId", getCampaigners);
campaignerRouter.put("/:id", updateCampaigner);
campaignerRouter.delete("/:id", deleteCampaigner);
export default campaignerRouter;
