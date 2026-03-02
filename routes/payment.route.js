import express from "express";
import { verifyPayment } from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/verify", verifyPayment);

export default paymentRouter;
