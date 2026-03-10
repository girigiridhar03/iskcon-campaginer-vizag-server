import express from "express";
import {
  createTempleDevote,
  deleteDevote,
  getTempleDevotes,
} from "../controllers/templeDevote.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { onlyAdmin } from "../middlewares/onlyAdmin.middleware.js";

const devoteRouter = express.Router();

devoteRouter.post("/", verifyToken, onlyAdmin, createTempleDevote);
devoteRouter.get("/", getTempleDevotes);
devoteRouter.delete("/:id", verifyToken, onlyAdmin, deleteDevote);

export default devoteRouter;
