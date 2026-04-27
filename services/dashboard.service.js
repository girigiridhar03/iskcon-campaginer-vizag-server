import Campaign from "../models/campaign.model.js";
import Campaigner from "../models/campaigner.model.js";
import Donation from "../models/donation.model.js";
import TempleDevote from "../models/templeDevote.model.js";
import { AppError } from "../utils/AppError.js";
import mongoose from "mongoose";

export const cardSummaryService = async (req) => {
  const role = req?.user?.role;
  const userId = req?.user?.id;
  const campaignId = req?.query?.campaignId;

  if (!role || !userId) {
    throw new AppError("Unauthorized user", 401);
  }

  if (campaignId && !mongoose.isValidObjectId(campaignId)) {
    throw new AppError("Invalid campaignId", 400);
  }

  if (role === "admin") {
    const campaignFilter = campaignId
      ? { _id: campaignId }
      : { status: "active" };
    const campaign = await Campaign.findOne(campaignFilter).select(
      "targetAmount raisedAmount",
    );

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    const campaignerFilter = {
      campaignId: campaign._id,
    };

    const donationFilter = {
      campaign: campaign._id,
      status: "success",
    };

    const [totalDonations, activeCampaigners, pendingCampaigners] =
      await Promise.all([
        Donation.countDocuments(donationFilter),
        Campaigner.countDocuments({ ...campaignerFilter, status: "active" }),
        Campaigner.countDocuments({ ...campaignerFilter, status: "pending" }),
      ]);

    return {
      status: 200,
      message: "Fetched card metric summary",
      data: {
        "Target Amount": campaign?.targetAmount || 0,
        "Total Raised": campaign?.raisedAmount || 0,
        "Total Donations": totalDonations,
        "Active Campaigners": activeCampaigners,
        "Pending Campaigners": pendingCampaigners,
      },
    };
  }

  if (role === "devotee") {
    const campaignFilter = campaignId ? { campaignId } : {};
    const devotee = await TempleDevote.findOne({ userId: userId }).select(
      "_id",
    );
    if (!devotee) {
      return {
        status: 200,
        message: "Devotee profile not found",
        data: {
          "Total Campaigners": 0,
          "Total Target": 0,
          "Total Raised": 0,
          "Total Donations": 0,
          "Pending Campaigners": 0,
        },
      };
    }
    const devoteeId = devotee._id;

    const campaigners = await Campaigner.find(
      {
        templeDevoteInTouch: devoteeId,
        status: "active",
        ...campaignFilter,
      },
      "_id targetAmount raisedAmount",
    );

    const campaignerIds = campaigners.map((c) => c._id);

    if (!campaignerIds.length) {
      return {
        status: 200,
        message: "No campaigners not found",
        data: {
          "Total Campaigners": 0,
          "Total Target": 0,
          "Total Raised": 0,
          "Total Donations": 0,
          "Pending Campaigners": 0,
        },
      };
    }
    const totals = campaigners.reduce(
      (acc, curr) => {
        acc.target += curr.targetAmount || 0;
        acc.raised += curr.raisedAmount || 0;
        return acc;
      },
      {
        target: 0,
        raised: 0,
      },
    );

    const [totalCampaigners, pendingCampaigners, totalDonations] =
      await Promise.all([
        Campaigner.countDocuments({
          templeDevoteInTouch: devotee?._id,
          status: "active",
          ...campaignFilter,
        }),
        Campaigner.countDocuments({
          templeDevoteInTouch: devotee?._id,
          status: "pending",
          ...campaignFilter,
        }),
        Donation.countDocuments({
          campaigner: { $in: campaignerIds },
          status: "success",
        }),
      ]);

    return {
      status: 200,
      message: "Fetched devotee dashboard summary",
      data: {
        "Total Campaigners": totalCampaigners || 0,
        "Total Target": totals?.target || 0,
        "Total Raised": totals?.raised || 0,
        "Total Donations": totalDonations || 0,
        "Pending Campaigners": pendingCampaigners || 0,
      },
    };
  }

  throw new AppError("Unauthorized role", 403);
};

export const donationTrendService = async (req) => {
  const role = req?.user?.role;
  const userId = req?.user?.id;
  const campaignId = req?.query?.campaignId;

  if (!role || !userId) {
    throw new AppError("Unauthorized user", 401);
  }

  if (campaignId && !mongoose.isValidObjectId(campaignId)) {
    throw new AppError("Invalid campaignId", 400);
  }

  if (role === "admin") {
    const matchFilter = {
      status: "success",
      ...(campaignId && { campaign: new mongoose.Types.ObjectId(campaignId) }),
    };

    const trends = await Donation.aggregate([
      {
        $match: matchFilter,
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          total: {
            $sum: "$amount",
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          amount: "$total",
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
      {
        $limit: 7,
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);

    return {
      status: 200,
      message: "trends fetched successfully",
      data: trends,
    };
  }

  if (role === "devotee") {
    const devotee = await TempleDevote.findOne({ userId: userId }).select(
      "_id",
    );
    if (!devotee) {
      return {
        status: 200,
        message: "Devotee Not found",
        data: [],
      };
    }

    const campaigners = await Campaigner.find(
      {
        templeDevoteInTouch: devotee._id,
        status: "active",
        ...(campaignId && { campaignId }),
      },
      "_id",
    );

    const campaignerIds = campaigners.map((c) => c._id);

    if (!campaignerIds.length) {
      return {
        status: 200,
        message: "No campaigners found",
        data: [],
      };
    }

    const trends = await Donation.aggregate([
      {
        $match: {
          campaigner: { $in: campaignerIds },
          status: "success",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          total: {
            $sum: "$amount",
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          amount: "$total",
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
      {
        $limit: 7,
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);

    return {
      status: 200,
      message: "trends fetched successfully",
      data: trends,
    };
  }

  throw new AppError("Unauthorized role", 403);
};
