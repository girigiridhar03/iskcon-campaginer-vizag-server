import crypto from "crypto";
import Payment from "../models/payment.model.js";
import Donation from "../models/donation.model.js";
import Campaigner from "../models/campaigner.model.js";
import Campaign from "../models/campaign.model.js";

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

      const existingPayment = await Payment.findOne({
        gatewayPaymentId: payment.id,
      });

      if (existingPayment) {
        return res.json({ status: "already_processed" });
      }

      await Payment.findOneAndUpdate(
        { gatewayOrderId: payment.order_id },
        {
          gatewayPaymentId: payment.id,
          status: "captured",
          rawResponse: payment,
        },
        { returnDocument: "after" },
      );

      const donation = await Donation.findById(payment.notes.donationId);

      if (!donation) {
        console.warn("Donation not found:", payment.order_id);
        return res.json({ status: "donation_not_found" });
      }

      if (donation.status === "success") {
        return res.json({ status: "already_processed" });
      }

      donation.status = "success";
      await donation.save();

      if (donation.campaign) {
        await Campaign.findByIdAndUpdate(donation.campaign, {
          $inc: { raisedAmount: donation.amount },
        });
      }

      if (donation.campaigner) {
        await Campaigner.findByIdAndUpdate(donation.campaigner, {
          $inc: { raisedAmount: donation.amount },
        });
      }
    }
    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;

      await Payment.findOneAndUpdate(
        { gatewayOrderId: payment.order_id },
        {
          status: "failed",
          rawResponse: payment,
        },
      );

      await Donation.findByIdAndUpdate(payment.order_id, {
        status: "failed",
      });
    }

    return res.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(200).json({ status: "error_logged" });
  }
};
