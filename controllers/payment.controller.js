import { verifyPaymentService } from "../services/payment.service.js";
import { asyncHandlers } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const verifyPayment = asyncHandlers(async (req, res) => {
  const { status, message } = await verifyPaymentService(req);

  response(res, status, message);
});
