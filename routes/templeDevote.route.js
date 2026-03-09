import express from "express";
import {
  createTempleDevote,
  getTempleDevotes,
} from "../controllers/templeDevote.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const devoteRouter = express.Router();

devoteRouter.post("/", verifyToken, createTempleDevote);
devoteRouter.get("/", getTempleDevotes);

export default devoteRouter;
