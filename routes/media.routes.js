import express from "express";
import { getMediaList } from "../controllers/media.controller.js";

const mediaRouter = express.Router();

mediaRouter.get("/", getMediaList);

export default mediaRouter;
