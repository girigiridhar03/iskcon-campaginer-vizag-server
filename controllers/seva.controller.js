import {
  addSevaService,
  getSevaService,
  getSingleSevaService,
} from "../services/seva.service.js";
import { asyncHandlers } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const addSeva = asyncHandlers(async (req, res) => {
  const { status, message, newSeva } = await addSevaService(req);

  response(res, status, message, newSeva);
});

export const getSeva = asyncHandlers(async (_, res) => {
  const { status, message, sevas } = await getSevaService();

  response(res, status, message, sevas);
});

export const getSingleSeva = asyncHandlers(async (req, res) => {
  const { status, message, seva } = await getSingleSevaService(req);

  response(res, status, message, seva);
});
