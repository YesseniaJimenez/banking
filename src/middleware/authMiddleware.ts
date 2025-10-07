import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

export interface RequestWithUserId extends Request {
  userId?: string;
}

export const authMiddleware = async (
  req: RequestWithUserId,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "token not provided" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "") as {
      userId: string;
    };

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.userId = payload.userId;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
