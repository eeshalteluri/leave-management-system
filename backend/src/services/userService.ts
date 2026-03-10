import User from "../models/User";

export const getLeaveBalance = async (userId: string) => {

  const user = await User.findById(userId)
    .select("leaveBalance");

  if (!user) {
    throw new Error("User not found");
  }

  return user.leaveBalance;
};