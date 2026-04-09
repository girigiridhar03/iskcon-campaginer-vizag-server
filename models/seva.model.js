import mongoose from "mongoose";

const sevaSchema = new mongoose.Schema(
  {
    sevaCategory: {
      type: String,
      required: true,
    },
    sevaCategoryId: {
      type: Number,
      required: true,
    },
    sevaCode: {
      type: String,
      required: true,
    },
    sevaSubCategory: {
      type: String,
      required: true,
    },
    sevaSubCategoryId: {
      type: Number,
      required: true,
    },
    sevaSubCode: {
      type: String,
      default: null,
    },
    sevaPoints: [
      {
        type: String,
        required: true,
      },
    ],
    sevaAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Seva = mongoose.model("Seva", sevaSchema);

export default Seva;
