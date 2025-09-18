import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  role?: string;
  password?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "user",
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
