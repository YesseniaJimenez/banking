import mongoose from "mongoose";

export async function connectToDatabase() {
  const uri =
    process.env.MONGO_URI ??
    "mongodb://admin:admin123@localhost:27017/mi_base?authSource=admin";

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB with Mongoose");
}
