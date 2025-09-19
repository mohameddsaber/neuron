import jwt from 'jsonwebtoken';
import type {  Response } from 'express';

export function generateTokenAndSetCookie(userId: unknown,res: Response) {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: "10d" });
    res.cookie("jwt", token, 
        { 
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 10 * 24 * 60 * 60 * 1000
         });
}