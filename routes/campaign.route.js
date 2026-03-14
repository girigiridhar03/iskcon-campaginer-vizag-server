import express from "express";
import {
  createCampaign,
  deleteCampaign,
  getCampaginList,
  getCurrentCampaign,
  getSingleCampaign,
  updateCampaign,
} from "../controllers/campaign.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import {
  authorizeRole,
  onlyAdmin,
} from "../middlewares/onlyAdmin.middleware.js";

const campaignRouter = express.Router();

campaignRouter.post("/", createCampaign);
campaignRouter.get("/", getCurrentCampaign);
campaignRouter.get(
  "/all-campagins",
  verifyToken,
  authorizeRole("admin", "devotee"),
  getCampaginList,
);
campaignRouter.get("/:id", verifyToken, onlyAdmin, getSingleCampaign);
campaignRouter.patch("/:id", verifyToken, onlyAdmin, updateCampaign);
campaignRouter.delete("/:id", verifyToken, onlyAdmin, deleteCampaign);
export default campaignRouter;
