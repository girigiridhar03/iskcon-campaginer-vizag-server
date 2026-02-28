import {
  createTempleDevoteService,
  getTempleDevotesService,
} from "../services/templeDevote.service.js";
import { asyncHandlers } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const createTempleDevote = asyncHandlers(async (req, res) => {
  const { status, message, newDevote } = await createTempleDevoteService(req);

  response(res, status, message, newDevote);
});

export const getTempleDevotes = asyncHandlers(async (_, res) => {
  const { status, message, devotes } = await getTempleDevotesService();

  response(res, status, message, devotes);
});
