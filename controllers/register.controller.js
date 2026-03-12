import {
  getAdminDetailsService,
  loginService,
  registerService,
  resetPasswordService,
} from "../services/register.service.js";
import { asyncHandlers } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const register = asyncHandlers(async (req, res) => {
  const { status, message, newRegister } = await registerService(req);

  response(res, status, message, newRegister);
});

export const login = asyncHandlers(async (req, res) => {
  const { status, message, data } = await loginService(req);
  response(res, status, message, data);
});

export const getAdminDetails = asyncHandlers(async (req, res) => {
  const { status, message, data } = await getAdminDetailsService(req);
  response(res, status, message, data);
});

export const resetPassword = asyncHandlers(async (req, res) => {
  const { status, message } = await resetPasswordService(req);
  response(res, status, message);
});
