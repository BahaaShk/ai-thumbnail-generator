import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export const generateToken = (userId: string) => {
    return jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, SECRET) as { userId: string };
};