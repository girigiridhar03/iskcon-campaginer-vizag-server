import {
  createCampaignerService,
  getCampaignerService,
  getLastestDonorofCampaignerService,
  getSingleCampaignerService,
  getTopDonorsService,
} from "../services/campaigner.service.js";
import { asyncHandlers } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const createCampaigner = asyncHandlers(async (req, res) => {
  const { status, message, newCampaigner } = await createCampaignerService(req);

  response(res, status, message, newCampaigner);
});

export const getCampaigners = asyncHandlers(async (req, res) => {
  const { status, message, campaigners, count, totalPages } =
    await getCampaignerService(req);

  response(res, status, message, { campaigners, count, totalPages });
});

export const getSingleCampaigner = asyncHandlers(async (req, res) => {
  const { status, message, campaginerWithImage, count } =
    await getSingleCampaignerService(req);

  response(res, status, message, { campaginers: campaginerWithImage, count });
});

export const getTopDonors = asyncHandlers(async (req, res) => {
  const { status, message, topDonors } = await getTopDonorsService(req);

  response(res, status, message, topDonors);
});

export const getLastestDonorofCampaigner = asyncHandlers(async (req, res) => {
  const { status, message, donations } =
    await getLastestDonorofCampaignerService(req);

  response(res, status, message, donations);
});
