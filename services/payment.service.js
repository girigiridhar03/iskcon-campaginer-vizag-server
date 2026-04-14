import crypto from "crypto";
import fs from "fs";
import path from "path";
import Payment from "../models/payment.model.js";
import Donation from "../models/donation.model.js";
import Campaigner from "../models/campaigner.model.js";
import Campaign from "../models/campaign.model.js";
import { dccApiService } from "../utils/utils.js";
import { AppError } from "../utils/AppError.js";
import { generateReceiptBuffer } from "./receipt.service.js";
import {
  sendRecieptWhatsapp,
  sendWhatsappMessage,
} from "./whatsapp.service.js";

const normalizePhoneNumber = (phoneNumber) => {
  const digits = phoneNumber?.replace(/\D/g, "");

  if (!digits) return null;

  return digits.startsWith("91") ? digits : `91${digits}`;
};

const sendDonationNotifications = async (updatedDonation, campaigner) => {
  if (!updatedDonation?.receiptNumber) {
    const phoneNumber = normalizePhoneNumber(updatedDonation?.donorPhone);

    if (phoneNumber) {
      await sendWhatsappMessage(
        phoneNumber,
        "regular_donation_success_message",
        [
          { type: "text", text: updatedDonation.donorName || "Donor" },
          {
            type: "text",
            text: Number(updatedDonation.amount || 0).toLocaleString("en-IN"),
          },
          {
            type: "text",
            text: "Mandir Nirmana Seva",
          },
          {
            type: "text",
            text: "Mandir Nirmana Seva",
          },
        ],
      );
    }

    return;
  }

  const tmpDir = path.join(process.cwd(), "tmp");

  fs.mkdirSync(tmpDir, { recursive: true });

  const filePath = path.join(
    tmpDir,
    `receipt-${updatedDonation.donorName}-${updatedDonation._id}.pdf`,
  );
  const pdfBytes = await generateReceiptBuffer(updatedDonation._id);
  fs.writeFileSync(filePath, pdfBytes);

  const phoneNumber = normalizePhoneNumber(updatedDonation.donorPhone);
  const devoteePhoneNumber = normalizePhoneNumber(
    campaigner?.templeDevoteInTouch?.phoneNumber,
  );
  const campaignerPhoneNumber = normalizePhoneNumber(campaigner?.phoneNumber);

  try {
    const promises = [];

    if (phoneNumber) {
      promises.push(
        sendRecieptWhatsapp(
          phoneNumber,
          filePath,
          updatedDonation.donorName,
          updatedDonation.amount,
        ),
      );
    }

    if (campaigner?.name) {
      const params = [
        { type: "text", text: campaigner.name },
        { type: "text", text: updatedDonation.donorName },
        {
          type: "text",
          text: Number(updatedDonation.amount || 0).toLocaleString("en-IN"),
        },
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
    }

    await Promise.all(promises);
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

export const capturePaymentService = async ({
  gatewayOrderId,
  gatewayPaymentId,
  gatewaySignature,
  rawResponse,
  donationId,
}) => {
  const paymentDoc = await Payment.findOne({
    gatewayOrderId,
  });

  if (!paymentDoc) {
    throw new AppError("Payment record not found", 404);
  }

  const linkedDonationId = paymentDoc.donation?.toString() || donationId;

  const existingDonation = await Donation.findById(linkedDonationId)
    .populate("seva")
    .populate({
      path: "campaigner",
      select: "templeDevoteInTouch",
      populate: {
        path: "templeDevoteInTouch",
        select: "devoteeID",
      },
    });

  if (!existingDonation) {
    throw new AppError("Donation record not found", 404);
  }

  if (
    paymentDoc.status === "captured" &&
    existingDonation.status === "success"
  ) {
    if (
      !paymentDoc.rawResponse &&
      rawResponse &&
      typeof rawResponse === "object" &&
      Object.keys(rawResponse).length > 0
    ) {
      paymentDoc.rawResponse = rawResponse;
      await paymentDoc.save();
    }

    if (!existingDonation.dccApiResponse) {
      const dccResponse = await dccApiService(
        existingDonation,
        gatewayPaymentId,
      );

      existingDonation.receiptNumber =
        existingDonation.receiptNumber ||
        dccResponse?.data?.ReceiptNumber ||
        null;
      existingDonation.gatewayPaymentId =
        existingDonation.gatewayPaymentId || gatewayPaymentId;
      existingDonation.dccDataSentAt = new Date();
      existingDonation.dccApiResponse = dccResponse;

      await existingDonation.save();
    }

    return {
      status: 200,
      message: "Payment already processed",
    };
  }

  const dccResponse = await dccApiService(existingDonation, gatewayPaymentId);

  const updatedDonation = await Donation.findOneAndUpdate(
    {
      _id: linkedDonationId,
      status: { $ne: "success" },
    },
    {
      status: "success",
      receiptNumber: dccResponse?.data?.ReceiptNumber || null,
      gatewayPaymentId,
      dccDataSentAt: new Date(),
      dccApiResponse: dccResponse,
    },
    { returnDocument: "after" },
  );

  let updatedCampaigner = null;

  if (updatedDonation) {
    if (updatedDonation.campaign) {
      await Campaign.findByIdAndUpdate(updatedDonation.campaign, {
        $inc: { raisedAmount: updatedDonation.amount },
      });
    }

    if (updatedDonation.campaigner) {
      updatedCampaigner = await Campaigner.findByIdAndUpdate(
        updatedDonation.campaigner,
        {
          $inc: { raisedAmount: updatedDonation.amount },
        },
        {
          returnDocument: "after",
        },
      ).populate("templeDevoteInTouch", "phoneNumber");
    }
  }

  paymentDoc.gatewayPaymentId = gatewayPaymentId;
  paymentDoc.status = "captured";

  if (gatewaySignature) {
    paymentDoc.gatewaySignature = gatewaySignature;
  }

  if (rawResponse) {
    paymentDoc.rawResponse = rawResponse;
  }

  await paymentDoc.save();

  if (updatedDonation) {
    try {
      await sendDonationNotifications(updatedDonation, updatedCampaigner);
    } catch (error) {
      console.error(
        "Payment captured but notification dispatch failed:",
        error,
      );
    }
  }

  return {
    status: 200,
    message: updatedDonation
      ? "Payment verified successfully"
      : "Payment already processed",
  };
};

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

  return capturePaymentService({
    gatewayOrderId: razorpay_order_id,
    gatewayPaymentId: razorpay_payment_id,
    gatewaySignature: razorpay_signature,
  });
};
