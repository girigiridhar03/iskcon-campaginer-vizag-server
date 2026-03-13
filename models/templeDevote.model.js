import mongoose from "mongoose";

const templeDevoteSchema = new mongoose.Schema(
  {
    devoteName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    shortForm: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const TempleDevote = mongoose.model("TempleDevote", templeDevoteSchema);

export default TempleDevote;
