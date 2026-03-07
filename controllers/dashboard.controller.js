import {
  cardSummaryService,
  donationTrendService,
} from "../services/dashboard.service.js";
import { asyncHandlers } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const cardSummary = asyncHandlers(async (req, res) => {
  const { status, message, data } = await cardSummaryService(req);

  response(res, status, message, data);
});

export const donationTrend = asyncHandlers(async (_, res) => {
  const { status, message, data } = await donationTrendService();
  response(res, status, message, data);
});
