import express from "express";
import {
  addSeva,
  deleteSeva,
  getSelectedSevaDetails,
  getSeva,
  updateSeva,
} from "../controllers/seva.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const sevaRouter = express.Router();

sevaRouter.post("/add", verifyToken, addSeva);
sevaRouter.get("/", getSeva);
sevaRouter.get("/:sevaId", getSelectedSevaDetails);
sevaRouter.delete("/:sevaId", verifyToken, deleteSeva);
sevaRouter.put("/:sevaId", verifyToken, updateSeva);

export default sevaRouter;
