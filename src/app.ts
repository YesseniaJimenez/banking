import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./db";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import transactionRoutes from "./routes/transaction";

dotenv.config();

if (!process.env.PORT) {
  throw new Error("missing required environment variable: PORT");
}
if (!process.env.MONGO_URI) {
  throw new Error("missing required environment variable: MONGO_URI");
}

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

export async function initApp() {
  await connectToDatabase();
  return app;
}
