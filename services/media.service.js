import Media from "../models/media.model.js";

export const getMediaListService = async () => {
  const mediaList = await Media.find({}).select("-_id -createdAt -updatedAt");

  return {
    status: 200,
    message: "Media fetched successfully",
    mediaList,
  };
};
