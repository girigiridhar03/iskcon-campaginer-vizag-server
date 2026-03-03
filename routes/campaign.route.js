import express from "express";
import {
  createCampaign,
  getCampaginList,
  getCurrentCampaign,
} from "../controllers/campaign.controller.js";

const campaignRouter = express.Router();

campaignRouter.post("/", createCampaign);
campaignRouter.get("/", getCurrentCampaign);
campaignRouter.get("/all-campagins", getCampaginList);

export default campaignRouter;
