import express from "express";
import * as leaveController from "../controllers/leaveController";
import { authMiddleware } from "../middlewares/authMiddleware";
import roleMiddleware from "../middlewares/roleMiddleware";

const router = express.Router();

router.post(
  "/apply",
  authMiddleware,
  roleMiddleware("employee"),
  leaveController.applyLeave
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("employee"),
  leaveController.myLeaves
);

router.get(
  "/all",
  authMiddleware,
  roleMiddleware("manager"),
  leaveController.allLeaves
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("manager"),
  leaveController.updateLeave
);

export default router;