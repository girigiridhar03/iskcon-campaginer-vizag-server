import express from "express";
import {
  getAdminDetails,
  login,
  register,
} from "../controllers/register.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { onlyAdmin } from "../middlewares/onlyAdmin.middleware.js";

const registerRouter = express.Router();

registerRouter.post("/register", register);
registerRouter.post("/login", login);
registerRouter.get("/", verifyToken,onlyAdmin, getAdminDetails);

export default registerRouter;
