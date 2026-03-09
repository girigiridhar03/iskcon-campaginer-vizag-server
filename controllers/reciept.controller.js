import { recieptDownloadService } from "../services/receipt.service.js";
import { asyncHandlers } from "../utils/handlers.js";

export const recieptDownload = asyncHandlers(async (req, res) => {
  await recieptDownloadService(req, res);
});
