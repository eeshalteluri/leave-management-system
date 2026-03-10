import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import * as userController from "../controllers/userController";

const router = express.Router();

router.get(
  "/leave-balance",
  authMiddleware,
  userController.getLeaveBalance
);

export default router;