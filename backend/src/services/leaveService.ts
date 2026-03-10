import Leave from "../models/Leave";
import User from "../models/User";
import mongoose from "mongoose";

import { leaveTypeBalanceKey } from "../utils/leaveTypeMap";
import { calculateLeaveDays } from "../utils/dateUtils";

export const createLeave = async (
  employeeId: string,
  leaveType: string,
  startDate: Date,
  endDate: Date,
  reason: string
) => {

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  // Normalize time to avoid timezone issues
  start.setHours(0,0,0,0);
  end.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  // 1️⃣ Validate required fields
  if (!leaveType || !start || !end) {
    throw new Error("leaveType, startDate and endDate are required");
  }

  // 2️⃣ Start date cannot be in the past
  if (start < today) {
    throw new Error("Start date cannot be in the past");
  }

  // 3️⃣ End date cannot be before start date
  if (end < start) {
    throw new Error("End date cannot be before start date");
  }

  // 4️⃣ Optional: Limit maximum leave duration (example: 30 days)
  const duration =
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;

  if (duration > 30) {
    throw new Error("Leave cannot exceed 30 days");
  }

  const employeeObjectId = new mongoose.Types.ObjectId(employeeId);

  // 5️⃣ Prevent duplicate leave request (same exact range + type)
  const duplicateLeave = await Leave.findOne({
    employeeId: employeeObjectId,
    leaveType,
    startDate: start,
    endDate: end,
    status: { $in: ["Pending", "Approved"] }
  });

  if (duplicateLeave) {
    throw new Error("A leave request for this exact period already exists");
  }

  // 6️⃣ Prevent overlapping leave requests (regardless of type)
  const overlappingLeave = await Leave.findOne({
    employeeId: employeeObjectId,
    status: { $in: ["Pending", "Approved"] },
    startDate: { $lte: end },
    endDate: { $gte: start }
  });

  if (overlappingLeave) {
    throw new Error(
      "You already have a leave request overlapping this date range"
    );
  }

  // 7️⃣ Check leave balance before creating request
  const balanceKey = leaveTypeBalanceKey[leaveType];

  if (balanceKey) {

    const daysRequested = duration;

    const user = await User.findById(employeeObjectId);

    if (!user) {
      throw new Error("User not found");
    }

    const currentBalance = user.leaveBalance[balanceKey];

    if (currentBalance < daysRequested) {
      throw new Error(
        `You only have ${currentBalance} ${balanceKey} leave days remaining`
      );
    }
  }

  // Create leave request
  try {

    const leave = await Leave.create({
      employeeId: employeeObjectId,
      leaveType,
      startDate: start,
      endDate: end,
      reason
    });

    return leave;

  } catch (error: any) {

    // Handle MongoDB duplicate index errors
    if (error.code === 11000) {
      throw new Error("Duplicate leave request already exists");
    }

    throw error;
  }
};

export const getEmployeeLeaves = async (employeeId: string) => {
  return await Leave.find({
    employeeId: new mongoose.Types.ObjectId(employeeId)
  });
};

export const getAllLeaves = async () => {
  const leaves = await Leave.find()
    .populate("employeeId", "name email createdAt updatedAt")
    .lean();

  return leaves.map((leave) => ({
    ...leave,
    employee: leave.employeeId,
    employeeId: undefined
  }));
};

export const updateLeaveStatus = async (
  leaveId: string,
  status: "Approved" | "Rejected"
) => {

  const leave = await Leave.findById(leaveId);

  if (!leave) throw new Error("Leave not found");

  // Only run balance logic if approving
  if (status === "Approved") {

    const balanceKey = leaveTypeBalanceKey[leave.leaveType];

    // Only certain leave types affect balance
    if (balanceKey) {

      const days = calculateLeaveDays(
        leave.startDate,
        leave.endDate
      );

      const user = await User.findById(leave.employeeId);

      if (!user) {
        throw new Error("User not found");
      }

      const currentBalance = user.leaveBalance[balanceKey];

      if (currentBalance < days) {
        throw new Error(
          `Insufficient ${balanceKey} leave balance`
        );
      }

      user.leaveBalance[balanceKey] -= days;

      await user.save();
    }
  }

  leave.status = status;

  await leave.save();

  await leave.populate("employeeId", "name email");

  const obj = leave.toObject();

  return {
    ...obj,
    employee: obj.employeeId,
    employeeId: undefined
  };
};