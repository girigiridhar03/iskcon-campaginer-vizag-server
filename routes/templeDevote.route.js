import express from "express";
import {
  createTempleDevote,
  getTempleDevotes,
} from "../controllers/templeDevote.controller.js";

const devoteRouter = express.Router();

devoteRouter.post("/", createTempleDevote);
devoteRouter.get("/", getTempleDevotes);

export default devoteRouter;
