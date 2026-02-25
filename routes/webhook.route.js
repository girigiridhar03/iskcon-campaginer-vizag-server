import express from "express";
import { razorpayWebhookService } from "../services/webhook.service.js";

const webhookRouter = express.Router();

webhookRouter.post("/razorpay", razorpayWebhookService);

export default webhookRouter;
