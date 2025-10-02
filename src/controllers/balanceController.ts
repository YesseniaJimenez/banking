import { Response } from "express";
import User from "../models/user";
import { RequestWithUserId } from "../middleware/authMiddleware";

export const depositMoney = async (req: RequestWithUserId, res: Response) => {
  try {
    const { amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }
    const user = await User.findById(req.userId);

    user.balance += amount;
    await user.save();

    return res
      .status(200)
      .json({ message: "Money deposited successfully", balance: user.balance });
  } catch (err: unknown) {
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : String(err) });
  }
};

export const withdrawMoney = async (req: RequestWithUserId, res: Response) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }
    const user = await User.findById(req.userId);

    if (user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    user.balance -= amount;
    await user.save();
    res
      .status(200)
      .json({ message: "Money withdrawn successfully", balance: user.balance });
  } catch (err: unknown) {
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : String(err) });
  }
};

export const transferMoney = async (req: RequestWithUserId, res: Response) => {
  try {
    const { toUserId, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    if (req.userId === toUserId) {
      return res
        .status(400)
        .json({ error: "You cannot transfer money to yourself" });
    }

    const fromUser = await User.findById(req.userId);
    const toUser = await User.findById(toUserId);

    if (!toUser) {
      return res.status(404).json({ error: "User to transfer to not found" });
    }

    if (fromUser.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    fromUser.balance -= amount;
    toUser.balance += amount;
    await fromUser.save();
    await toUser.save();
    res.status(200).json({
      message: "Money transferred successfully",
      balance: fromUser.balance,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : String(err) });
  }
};
