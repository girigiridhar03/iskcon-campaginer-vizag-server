import express from "express";
import {
  addSeva,
  getSeva,
  getSingleSeva,
} from "../controllers/seva.controller.js";

const sevaRouter = express.Router();

sevaRouter.post("/add", addSeva);
sevaRouter.get("/", getSeva);
sevaRouter.get("/:sevaId", getSingleSeva);

export default sevaRouter;
