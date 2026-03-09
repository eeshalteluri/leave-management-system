import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id: string, role: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret not configured");
  }

  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: "employee" | "manager"
) => {

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role
  });

  const token = generateToken(user._id.toString(), user.role);

  return { token, user };
};

export const loginUser = async (
  email: string,
  password: string
) => {

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id.toString(), user.role);

  return { token, user };
};