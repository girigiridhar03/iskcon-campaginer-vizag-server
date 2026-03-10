import express from "express";
import {
  cardSummary,
  donationTrend,
} from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { onlyAdmin } from "../middlewares/onlyAdmin.middleware.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/summary", verifyToken, onlyAdmin, cardSummary);
dashboardRouter.get("/donation-trend", verifyToken, onlyAdmin, donationTrend);

export default dashboardRouter;
