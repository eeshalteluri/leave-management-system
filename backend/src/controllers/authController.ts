import { Request, Response } from "express";
import * as authService from "../services/authService";

export const signup = async (req: Request, res: Response) => {
  try {

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const data = await authService.registerUser(
      name,
      email,
      password,
      role
    );

    res.status(201).json({
      message: "User registered successfully",
      token: data.token,
      user: data.user
    });

  } catch (error: any) {

    console.error("Signup error:", error);

    res.status(400).json({
      message: error.message || "Signup failed"
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const data = await authService.loginUser(
      email,
      password
    );

    res.status(200).json({
      message: "Login successful",
      token: data.token,
      user: data.user
    });

  } catch (error: any) {

    console.error("Login error:", error);

    res.status(400).json({
      message: error.message || "Login failed"
    });
  }
};