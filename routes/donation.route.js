import express from "express";
import {
  createDonationOrder,
  getDonorDetails,
  getDonors,
} from "../controllers/donation.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { onlyAdmin } from "../middlewares/onlyAdmin.middleware.js";

const donationRouter = express.Router();

donationRouter.post("/create-order", createDonationOrder);
donationRouter.get("/", verifyToken, onlyAdmin, getDonors);

donationRouter.get("/:donationId", getDonorDetails);

export default donationRouter;
