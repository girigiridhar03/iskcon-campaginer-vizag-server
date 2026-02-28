import { getMediaListService } from "../services/media.service.js";
import { asyncHandlers } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const getMediaList = asyncHandlers(async (_, res) => {
  const { status, message, mediaList } = await getMediaListService();

  response(res, status, message, mediaList);
});
