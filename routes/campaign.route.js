import express from "express";
import {
  createCampaign,
  getCampaginList,
  getCurrentCampaign,
} from "../controllers/campaign.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const campaignRouter = express.Router();

campaignRouter.post("/", createCampaign);
campaignRouter.get("/", getCurrentCampaign);
campaignRouter.get("/all-campagins", verifyToken, getCampaginList);

export default campaignRouter;
