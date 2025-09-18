import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import User, {type IUser } from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";
import { protect, admin } from "../middleware/auth.js";

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const isAuthenticated = [
  protect,
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    next();
  },
];
export const isAdmin = [
  protect,
  admin,
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    next();
  },
]
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    generateTokenAndSetCookie(user._id, res);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    generateTokenAndSetCookie(user._id, res);

    res.json({
      success: true,
      message: "Logged in successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, message });
  }
};

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.user._id)
      .select("-password")

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("jwt");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, message });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, message });
  }
};
