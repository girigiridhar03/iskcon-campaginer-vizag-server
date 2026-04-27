import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectToDB } from "../config/DBConnection.js";
import "../models/seva.model.js";
import "../models/campaign.model.js";
import "../models/campaigner.model.js";
import "../models/templeDevote.model.js";
import Donation from "../models/donation.model.js";
import Payment from "../models/payment.model.js";
import { capturePaymentService } from "../services/payment.service.js";

dotenv.config();

const donationId = process.argv[2];
const paymentIdArg = process.argv[3];

const getLatestCapturedPayment = (payments = []) => {
  const capturedPayments = payments.filter(
    (payment) => payment.status === "captured",
  );

  if (!capturedPayments.length) {
    return null;
  }

  return capturedPayments.sort((left, right) => {
    const leftCapturedAt = Number(left.captured_at || 0);
    const rightCapturedAt = Number(right.captured_at || 0);

    return rightCapturedAt - leftCapturedAt;
  })[0];
};

const reconcileCapturedDonation = async () => {
  if (!donationId) {
    throw new Error(
      "Donation id is required. Usage: npm run reconcile:donation -- <donationId> [razorpayPaymentId]",
    );
  }

  if (!mongoose.isValidObjectId(donationId)) {
    throw new Error(`Invalid donation id: ${donationId}`);
  }

  const donation = await Donation.findById(donationId);

  if (!donation) {
    throw new Error(`Donation not found: ${donationId}`);
  }

  const paymentDoc = await Payment.findOne({ donation: donation._id });

  if (!paymentDoc?.gatewayOrderId) {
    throw new Error(
      `Payment record with gateway order id not found for donation ${donationId}`,
    );
  }

  if (!process.env.RAZORPAY_API_KEY || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "RAZORPAY_API_KEY and RAZORPAY_KEY_SECRET must be configured",
    );
  }

  const { default: razorpay } = await import("../config/razorpay.js");
  const paymentList = await razorpay.orders.fetchPayments(
    paymentDoc.gatewayOrderId,
  );
  let capturedPayment = getLatestCapturedPayment(paymentList?.items);

  if (!capturedPayment && paymentIdArg) {
    const fetchedPayment = await razorpay.payments.fetch(paymentIdArg);

    if (fetchedPayment?.status !== "captured") {
      throw new Error(
        `Provided payment ${paymentIdArg} is not captured. Current status: ${fetchedPayment?.status || "unknown"}`,
      );
    }

    if (fetchedPayment?.order_id !== paymentDoc.gatewayOrderId) {
      throw new Error(
        `Provided payment ${paymentIdArg} belongs to order ${fetchedPayment?.order_id}, but DB payment record points to ${paymentDoc.gatewayOrderId}`,
      );
    }

    capturedPayment = fetchedPayment;
  }

  if (!capturedPayment) {
    const orderPayments = (paymentList?.items || []).map((payment) => ({
      id: payment.id,
      order_id: payment.order_id,
      status: payment.status,
      captured: payment.captured,
      captured_at: payment.captured_at,
      method: payment.method,
      amount: payment.amount,
      created_at: payment.created_at,
    }));

    throw new Error(
      `No captured Razorpay payment found for order ${paymentDoc.gatewayOrderId}. Order payments: ${JSON.stringify(orderPayments)}`,
    );
  }

  const result = await capturePaymentService({
    gatewayOrderId: paymentDoc.gatewayOrderId,
    gatewayPaymentId: capturedPayment.id,
    rawResponse: capturedPayment,
    donationId: donation._id.toString(),
  });

  const updatedDonation = await Donation.findById(donation._id).select(
    "status gatewayPaymentId receiptNumber dccDataSentAt updatedAt",
  );
  const updatedPayment = await Payment.findById(paymentDoc._id).select(
    "status gatewayPaymentId updatedAt",
  );

  console.log(
    JSON.stringify(
      {
        message: result.message,
        donation: updatedDonation,
        payment: updatedPayment,
      },
      null,
      2,
    ),
  );
};

try {
  await connectToDB();
  await reconcileCapturedDonation();
} catch (error) {
  console.error("Reconciliation failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
