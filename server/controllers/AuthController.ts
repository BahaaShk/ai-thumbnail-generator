import { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

// Controllers for user registration
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Find user by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Generate JWT token instead of session
    const token = generateToken(newUser._id.toString());

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Controllers for user login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token instead of session
    const token = generateToken(user._id.toString());

    return res.json({
      message: "Logged in successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Controllers for user logout
export const logoutUser = async (req: Request, res: Response) => {
  // JWT is stateless — nothing to destroy on the server
  // The frontend will delete the token from localStorage
  return res.json({ message: "Logout Successful" });
};

// Controllers for user verify
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password"); // ← req.userId not req.session.userId

    if (!user) {
      return res.status(400).json({ message: "Invalid User" });
    }

    return res.json({ user });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};