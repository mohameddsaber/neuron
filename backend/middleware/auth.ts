import jwt from "jsonwebtoken";
import User, { type IUser } from "../models/user.model.js";
import type { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as {
      id: string;
    };

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error("Auth error:", error.message);
    res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

export const admin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized as admin",
    });
  }
};
