import {
  addSevaService,
  deleteSevaService,
  getSelectedSevaDetailsService,
  getSevaService,
  updateSevaService,
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

export const deleteSeva = asyncHandlers(async (req, res) => {
  const { status, message, data } = await deleteSevaService(req);

  response(res, status, message, data);
});

export const updateSeva = asyncHandlers(async (req, res) => {
  const { status, message, data } = await updateSevaService(req);

  response(res, status, message, data);
});

export const getSelectedSevaDetails = asyncHandlers(async (req, res) => {
  const { status, message, data } = await getSelectedSevaDetailsService(req);

  response(res, status, message, data);
});
