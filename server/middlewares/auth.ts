import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.js'

// Extend Express Request type to include userId
declare module 'express' {
  interface Request {
    userId?: string;
  }
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "You are not logged in" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Attach directly to req — NOT req.session (session doesn't persist on Vercel)
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protect;