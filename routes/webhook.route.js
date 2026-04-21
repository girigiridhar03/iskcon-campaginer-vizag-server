import express from "express";
import { razorpayWebhookService } from "../services/webhook.service.js";

const webhookRouter = express.Router();

webhookRouter.post("/", razorpayWebhookService);

export default webhookRouter;
