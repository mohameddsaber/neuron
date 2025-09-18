import express, { Router } from "express";
import { register, login, getUserProfile,getAllUsers,logout } from "../controllers/user.controller.js";
import { protect,admin } from "../middleware/auth.js";

const router: Router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout",protect,logout);
router.get("/profile", protect, getUserProfile);
router.get("/getall-users",admin,getAllUsers);

export default router;