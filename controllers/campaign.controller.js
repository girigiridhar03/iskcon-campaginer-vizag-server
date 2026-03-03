import {
  createCampaignService,
  getCampaginListService,
  getCurrentCampaignService,
} from "../services/campaign.service.js";
import { asyncHandlers } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const createCampaign = asyncHandlers(async (req, res) => {
  const { status, message, campaign } = await createCampaignService(req);

  response(res, status, message, campaign);
});

export const getCurrentCampaign = asyncHandlers(async (req, res) => {
  const { status, message, campaign } = await getCurrentCampaignService(req);

  response(res, status, message, campaign);
});

export const getCampaginList = asyncHandlers(async (req, res) => {
  const { status, message, data, total, totalPages } =
    await getCampaginListService(req);

  response(res, status, message, { data, total, totalPages });
});
