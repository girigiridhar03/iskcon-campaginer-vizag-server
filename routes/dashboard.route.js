import express from "express";
import {
  cardSummary,
  donationTrend,
} from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/summary", verifyToken, cardSummary);
dashboardRouter.get("/donation-trend", verifyToken, donationTrend);

export default dashboardRouter;
