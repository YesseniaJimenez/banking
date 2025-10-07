import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import bcrypt from "bcryptjs";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.status(200).json(
      users.map((user: IUser) => ({
        username: user.username,
        email: user.email,
        balance: user.balance,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? String(err) });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = req.body;
    if (!user.email || !user.username || !user.password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const result = await User.create({
      ...user,
      password: hashedPassword,
      balance: user.balance ?? 0,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: result._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? String(err) });
  }
};
