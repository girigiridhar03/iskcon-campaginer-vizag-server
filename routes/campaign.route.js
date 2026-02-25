import express from "express";
import {
  createCampaign,
  getCurrentCampaign,
} from "../controllers/campaign.controller.js";

const campaignRouter = express.Router();

campaignRouter.post("/", createCampaign);
campaignRouter.get("/", getCurrentCampaign);

export default campaignRouter;
