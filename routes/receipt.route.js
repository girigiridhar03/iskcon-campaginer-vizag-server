import express from "express";
import { recieptDownload } from "../controllers/reciept.controller.js";

const recieptRouter = express.Router();

recieptRouter.get("/:id", recieptDownload);

export default recieptRouter;
