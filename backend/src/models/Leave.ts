import mongoose, { Document, Schema } from "mongoose";

export interface ILeave extends Document {
  employeeId: mongoose.Types.ObjectId;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

const leaveSchema = new Schema<ILeave>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  leaveType: { type: String, required: true },

  startDate: Date,
  endDate: Date,

  reason: String,

  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  }
});

export default mongoose.model<ILeave>("Leave", leaveSchema);