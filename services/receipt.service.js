import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";
import Donation from "../models/donation.model.js";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import numToWord from "number-to-words";
import path from "path";

export const recieptDownloadService = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError(`donationId is required`, 400);
  }

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(`Invalid id: ${id}`, 400);
  }

  const donationDetails = await Donation.findById(id);

  if (!donationDetails) {
    throw new AppError("donation not found", 404);
  }
  const amountWords =
    numToWord.toWords(donationDetails.amount).toUpperCase() + " RUPEES ONLY";
  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");
  const formattedDate = formatDate(donationDetails.createdAt);
  const taxExemption = donationDetails.pan ? "YES" : "NO";
  const addressParts = donationDetails?.address
    ? Object.values(donationDetails.address).filter(Boolean)
    : [];

  const address = addressParts.length ? addressParts.join(", ") : "---";
  const filePath = path.join(process.cwd(), "receipt-template.pdf");

  const existingPdf = fs.readFileSync(filePath);

  const pdfDoc = await PDFDocument.load(existingPdf);

  const form = pdfDoc.getForm();

  form.getTextField("name").setText(donationDetails.donorName.toUpperCase());
  form.getTextField("phoneNum").setText(donationDetails.donorPhone);
  form.getTextField("inWords").setText(amountWords);
  form.getTextField("date").setText(formattedDate);
  form.getTextField("80G").setText(taxExemption);
  form.getTextField("transactionDate").setText(formattedDate);
  form.getTextField("address").setText(address);
  form
    .getTextField("amount")
    .setText(`RS.${donationDetails.amount.toLocaleString("en-IN")}/-`);
  form
    .getTextField("transactionNumber")
    .setText(donationDetails.gatewayPaymentId);
  form.getTextField("receiptNum").setText(donationDetails.receiptNumber);
  form.flatten();
  const pdfBytes = await pdfDoc.save();
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=receipt.pdf",
  });

  res.send(Buffer.from(pdfBytes));
};
