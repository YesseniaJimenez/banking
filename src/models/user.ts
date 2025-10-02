import mongoose from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  balance: number;
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  balance: { type: Number, required: true },
});

const User = mongoose.model("User", userSchema);

export default User;
