import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z
    .string()
    .refine(
      (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
      { message: "MONGO_URI must be a valid MongoDB URI" }
    ),
  JWT_SECRET: z.string().min(1, { message: "JWT_SECRET is required" }),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.issues);
  process.exit(1);
}

export const env = parsedEnv.data;
