import express from "express";
import {
  addSeva,
  deleteSeva,
  getSelectedSevaDetails,
  getSeva,
  updateSeva,
} from "../controllers/seva.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { onlyAdmin } from "../middlewares/onlyAdmin.middleware.js";

const sevaRouter = express.Router();

sevaRouter.post("/add", verifyToken, onlyAdmin, addSeva);
sevaRouter.get("/", getSeva);
sevaRouter.get("/:sevaId", getSelectedSevaDetails);
sevaRouter.delete("/:sevaId", verifyToken, onlyAdmin, deleteSeva);
sevaRouter.put("/:sevaId", verifyToken, onlyAdmin, updateSeva);

export default sevaRouter;
