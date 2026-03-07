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
  roleMiddleware("employer"),
  leaveController.allLeaves
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("employer"),
  leaveController.updateLeave
);

export default router;