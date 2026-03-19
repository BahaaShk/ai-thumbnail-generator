import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not logged in" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        req.session.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};