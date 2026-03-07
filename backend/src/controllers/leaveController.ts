import { Response } from "express";
import { AuthRequest } from "../types/auth";
import * as leaveService from "../services/leaveService";

export const applyLeave = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    // Basic validation
    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({
        message: "leaveType, startDate and endDate are required"
      });
    }

    const leave = await leaveService.createLeave(
      req.user.id,
      leaveType,
      startDate,
      endDate,
      reason
    );

    res.status(201).json({
      message: "Leave request submitted",
      leave
    });

  } catch (error: any) {
    console.error("Apply leave error:", error);

    res.status(500).json({
      message: error.message || "Internal server error"
    });
  }
};

export const myLeaves = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const leaves = await leaveService.getEmployeeLeaves(req.user.id);

    res.status(200).json({
      message: "Employee leave requests fetched",
      leaves
    });

  } catch (error) {
    console.error("Fetch employee leaves error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const allLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const leaves = await leaveService.getAllLeaves();

    res.status(200).json({
      message: "All leave requests fetched",
      leaves
    });

  } catch (error) {
    console.error("Fetch all leaves error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const updateLeave = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const leaveId = req.params.id;
    const { status } = req.body;

    if (!leaveId) {
      return res.status(400).json({
        message: "Leave ID is required"
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Status is required"
      });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected"
      });
    }

    const leave = await leaveService.updateLeaveStatus(
      leaveId as string,
      status
    );

    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found"
      });
    }

    res.status(200).json({
      message: "Leave status updated",
      leave
    });

  } catch (error) {
    console.error("Update leave error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};