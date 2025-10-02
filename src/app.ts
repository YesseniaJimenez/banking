import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./db";
import userRoutes from "./routes/users";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);

export async function initApp() {
  await connectToDatabase();
  return app;
}
