import Leave from "../models/Leave";
import mongoose from "mongoose";

export const createLeave = async (
  employeeId: string,
  leaveType: string,
  startDate: Date,
  endDate: Date,
  reason: string
) => {

  if (new Date(endDate) < new Date(startDate)) {
    throw new Error("End date cannot be before start date");
  }

  const leave = await Leave.create({
    employeeId: new mongoose.Types.ObjectId(employeeId),
    leaveType,
    startDate,
    endDate,
    reason
  });

  return leave;
};

export const getEmployeeLeaves = async (employeeId: string) => {
  return await Leave.find({
    employeeId: new mongoose.Types.ObjectId(employeeId)
  });
};

export const getAllLeaves = async () => {
  return await Leave.find().populate("employeeId", "name email");
};

export const updateLeaveStatus = async (
  leaveId: string,
  status: "Approved" | "Rejected"
) => {

  return await Leave.findByIdAndUpdate(
    leaveId,
    { status },
    { new: true }
  );
};