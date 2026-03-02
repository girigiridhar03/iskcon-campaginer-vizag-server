import express from "express";
import {
  addSeva,
  deleteSeva,
  getSeva,
  getSingleSeva,
  updateSeva,
} from "../controllers/seva.controller.js";

const sevaRouter = express.Router();

sevaRouter.post("/add", addSeva);
sevaRouter.get("/", getSeva);
sevaRouter.get("/:sevaId", getSingleSeva);
sevaRouter.delete("/:sevaId", deleteSeva);
sevaRouter.put("/:sevaId", updateSeva);

export default sevaRouter;
