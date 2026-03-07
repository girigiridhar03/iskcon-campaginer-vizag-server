import express from "express";
import {
  cardSummary,
  donationTrend,
} from "../controllers/dashboard.controller.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/summary", cardSummary);
dashboardRouter.get("/donation-trend", donationTrend);

export default dashboardRouter;
