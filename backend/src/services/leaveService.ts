import Leave from "../models/Leave";
import mongoose from "mongoose";

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

  // 7️⃣ Create leave request
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

  leave.status = status;

  await leave.save(); // timestamps update automatically

  await leave.populate("employeeId", "name email");

  const obj = leave.toObject();

  return {
    ...obj,
    employee: obj.employeeId,
    employeeId: undefined
  };
};