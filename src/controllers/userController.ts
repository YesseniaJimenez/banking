import { getDb } from "../db";
import { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const users = await db.collection("users").find({}).toArray();
    res.status(200).json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? String(err) });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const user = req.body;
    if (!user.email || !user.username || !user.password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await db
      .collection("users")
      .findOne({ email: user.email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const result = await db.collection("users").insertOne(user);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: result.insertedId,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? String(err) });
  }
};
