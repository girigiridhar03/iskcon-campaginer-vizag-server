import crypto from "crypto";
import Payment from "../models/payment.model.js";
import Donation from "../models/donation.model.js";
import Campaigner from "../models/campaigner.model.js";
import Campaign from "../models/campaign.model.js";
import { generateReceiptNumber } from "../utils/utils.js";
import { AppError } from "../utils/AppError.js";
import path from "path";
import { generateReceiptBuffer } from "./receipt.service.js";
import {
  sendRecieptWhatsapp,
  sendWhatsappMessage,
} from "./whatsapp.service.js";
import fs from "fs";

export const verifyPaymentService = async (req) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError("Missing payment verification fields", 400);
  }
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new AppError("Invalid Razorpay signature", 400);
  }

  const paymentDoc = await Payment.findOne({
    gatewayOrderId: razorpay_order_id,
  });

  if (!paymentDoc) {
    throw new AppError("Payment record not found", 404);
  }

  if (paymentDoc.status === "captured") {
    return {
      status: 200,
      message: "Payment already processed",
    };
  }

  paymentDoc.gatewayPaymentId = razorpay_payment_id;
  paymentDoc.gatewaySignature = razorpay_signature;
  paymentDoc.status = "captured";
  await paymentDoc.save();
  const receiptNumber = generateReceiptNumber();
  const updatedDonation = await Donation.findOneAndUpdate(
    {
      _id: paymentDoc.donation,
      status: { $ne: "success" },
    },
    { status: "success", receiptNumber, gatewayPaymentId: razorpay_payment_id },
    { returnDocument: "after" },
  );

  if (updatedDonation) {
    if (updatedDonation.campaign) {
      await Campaign.findByIdAndUpdate(updatedDonation.campaign, {
        $inc: { raisedAmount: updatedDonation.amount },
      });
    }

    let campaigner;
    if (updatedDonation.campaigner) {
      campaigner = await Campaigner.findByIdAndUpdate(
        updatedDonation.campaigner,
        {
          $inc: { raisedAmount: updatedDonation.amount },
        },
        {
          returnDocument: "after",
        },
      ).populate("templeDevoteInTouch", "phoneNumber");
    }

    const tmpDir = path.join(process.cwd(), "tmp");

    fs.mkdirSync(tmpDir, { recursive: true });

    const filePath = path.join(tmpDir, `receipt-${updatedDonation._id}.pdf`);
    const pdfBytes = await generateReceiptBuffer(updatedDonation._id);
    fs.writeFileSync(filePath, pdfBytes);

    const phoneNumber = updatedDonation.donorPhone
      .replace(/\D/g, "")
      .startsWith("91")
      ? updatedDonation.donorPhone.replace(/\D/g, "")
      : `91${updatedDonation.donorPhone.replace(/\D/g, "")}`;

    const devoteePhoneNumber = campaigner?.templeDevoteInTouch?.phoneNumber
      ?.replace(/\D/g, "")
      ?.startsWith("91")
      ? campaigner.templeDevoteInTouch.phoneNumber.replace(/\D/g, "")
      : `91${campaigner?.templeDevoteInTouch?.phoneNumber?.replace(/\D/g, "")}`;

    const campaignerPhoneNumber = campaigner.phoneNumber
      ?.replace(/\D/g, "")
      ?.startsWith("91")
      ? campaigner.phoneNumber?.replace(/\D/g, "")
      : `91${campaigner.phoneNumber?.replace(/\D/g, "")}`;

    try {
      const params = [
        { type: "text", text: campaigner.name },
        { type: "text", text: updatedDonation?.donorName },
        { type: "text", text: String(updatedDonation?.amount) },
      ];

      const promises = [
        sendRecieptWhatsapp(
          phoneNumber,
          filePath,
          updatedDonation.donorName,
          updatedDonation.amount,
        ),
      ];

      if (campaignerPhoneNumber) {
        promises.push(
          sendWhatsappMessage(
            campaignerPhoneNumber,
            "campaigner_donation_notification",
            params,
          ),
        );
      }

      if (devoteePhoneNumber) {
        promises.push(
          sendWhatsappMessage(
            devoteePhoneNumber,
            "preacher_group_alert",
            params,
          ),
        );
      }

      await Promise.all(promises);
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  return {
    status: 200,
    message: "Payment verified successfully",
  };
};
