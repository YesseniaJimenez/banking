import {
  depositMoney,
  transferMoney,
  withdrawMoney,
} from "../controllers/balanceController";
import { authMiddleware } from "../middleware/authMiddleware";
import { Router } from "express";

const router = Router();

router.post("/deposit", authMiddleware, depositMoney);
router.post("/withdraw", authMiddleware, withdrawMoney);
router.post("/transfer", authMiddleware, transferMoney);

export default router;
