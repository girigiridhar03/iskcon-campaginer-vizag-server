import crypto from "crypto";
import Payment from "../models/payment.model.js";
import Donation from "../models/donation.model.js";
import { capturePaymentService } from "./payment.service.js";

export const razorpayWebhookService = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const razorpaySignature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const result = await capturePaymentService({
        gatewayOrderId: payment.order_id,
        gatewayPaymentId: payment.id,
        rawResponse: payment,
        donationId: payment.notes?.donationId,
      });

      return res.json({
        status:
          result.message === "Payment already processed"
            ? "already_processed"
            : "ok",
      });
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const donationId = payment.notes.donationId;

      await Payment.findOneAndUpdate(
        { gatewayOrderId: payment.order_id, status: { $ne: "captured" } },
        { status: "failed", rawResponse: payment },
      );

      await Donation.findOneAndUpdate(
        { _id: donationId, status: { $ne: "success" } },
        { status: "failed" },
      );
    }

    return res.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(200).json({ status: "error_logged" });
  }
};
