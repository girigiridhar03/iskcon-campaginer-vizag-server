import mongoose from "mongoose";
import Seva from "../models/seva.model.js";
import { AppError } from "../utils/AppError.js";

export const addSevaService = async (req) => {
  const { sevaName, sevaPoints, sevaAmount } = req.body;

  const requiredFields = ["sevaName", "sevaPoints", "sevaAmount"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      throw new AppError(`${field} is required`, 400);
    }
  }

  if (!Array.isArray(sevaPoints)) {
    throw new AppError("Seva Points need to be in array", 400);
  }

  if (isNaN(Number(sevaAmount))) {
    throw new AppError("SevaAmount must be a number", 400);
  }

  if (Number(sevaAmount) <= 0) {
    throw new AppError("SevaAmount must be in positive digits", 400);
  }

  const newSeva = await Seva.create({
    sevaName,
    sevaAmount,
    sevaPoints,
  });

  return {
    status: 200,
    message: "Seva created successfully",
    newSeva,
  };
};

export const getSevaService = async () => {
  const sevas = await Seva.find({})
    .sort({ sevaAmount: 1 })
    .select("-createdAt -updatedAt");

  return {
    status: 200,
    message: "Seva List fetched successfully",
    sevas,
  };
};

export const deleteSevaService = async (req) => {
  const sevaId = req.params.sevaId;

  if (!sevaId) {
    throw new AppError(`SevaId is required`, 400);
  }

  if (!mongoose.isValidObjectId(sevaId)) {
    throw new AppError(`Invalid SevaId: ${sevaId}`);
  }

  const deletedSeva = await Seva.findByIdAndDelete(sevaId);

  if (!deletedSeva) {
    throw new AppError("Seva not found", 404);
  }

  return {
    status: 200,
    message: "Seva deleted successfully",
    data: deletedSeva,
  };
};

export const updateSevaService = async (req) => {
  const sevaId = req.params.sevaId;
  const { sevaName, sevaPoints, sevaAmount } = req.body;

  if (!sevaId) {
    throw new AppError(`SevaId is required`, 400);
  }

  if (!mongoose.isValidObjectId(sevaId)) {
    throw new AppError(`Invalid SevaId: ${sevaId}`);
  }

  const updatedSeva = await Seva.findByIdAndUpdate(
    sevaId,
    { sevaName, sevaAmount, sevaPoints },
    { returnDocument: "after", runValidators: true },
  );

  return {
    status: 200,
    message: "Seva updated successfully",
    data: updatedSeva,
  };
};

export const getSelectedSevaDetailsService = async (req) => {
  const sevaId = req.params.sevaId;

  if (!sevaId) {
    throw new AppError("SevaId is required", 400);
  }

  if (!mongoose.isValidObjectId(sevaId)) {
    throw new AppError(`Invalid SevaId: ${sevaId}`, 400);
  }

  const singleSeva = await Seva.findById(sevaId).select(
    "-createdAt -updatedAt",
  );

  if (!singleSeva) {
    throw new AppError(`Seva not found`, 404);
  }

  return {
    status: 200,
    message: "Single Details fetched successfully",
    data: singleSeva,
  };
};
