import express from "express";
import {
  addSeva,
  deleteSeva,
  getSelectedSevaDetails,
  getSeva,
  updateSeva,
} from "../controllers/seva.controller.js";

const sevaRouter = express.Router();

sevaRouter.post("/add", addSeva);
sevaRouter.get("/", getSeva);
sevaRouter.get("/:sevaId", getSelectedSevaDetails);
sevaRouter.delete("/:sevaId", deleteSeva);
sevaRouter.put("/:sevaId", updateSeva);

export default sevaRouter;
