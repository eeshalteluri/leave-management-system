import { Response } from "express";
import { AuthRequest } from "../types/auth";
import * as userService from "../services/userService";

export const getLeaveBalance = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const balance = await userService.getLeaveBalance(req.user.id);

    res.status(200).json({
      message: "Leave balance fetched",
      balance
    });

  } catch (error: any) {

    console.error("Fetch leave balance error:", error);

    res.status(500).json({
      message: error.message || "Internal server error"
    });
  }
};