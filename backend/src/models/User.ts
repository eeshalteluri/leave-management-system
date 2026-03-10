import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "employee" | "manager";

  leaveBalance: {
    annual: number;
    sick: number;
    casual: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: true 
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["employee", "manager"],
    default: "employee"
  },

  leaveBalance: {
      annual: {
        type: Number,
        default: 20
      },
      sick: {
        type: Number,
        default: 10
      },
      casual: {
        type: Number,
        default: 7
      }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IUser>("User", userSchema);