import mongoose from "mongoose";

const sevaSchema = new mongoose.Schema(
  {
    sevaName: {
      type: String,
      required: true,
      index: true,
      trim: true,
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
