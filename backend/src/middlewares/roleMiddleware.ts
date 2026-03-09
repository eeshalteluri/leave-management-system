import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";

const roleMiddleware = (requiredRole: "employee" | "manager") => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized"
        });
      }

      if (req.user.role !== requiredRole) {
        return res.status(403).json({
          message: "Forbidden: Access denied"
        });
      }

      next();

    } catch (error) {
      console.error("Role middleware error:", error);

      res.status(500).json({
        message: "Internal server error"
      });
    }
  };
};

export default roleMiddleware;