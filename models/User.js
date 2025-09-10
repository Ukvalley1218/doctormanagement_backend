import mongoose from "mongoose";
import { generateSequentialId } from "../utils/generateId.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    userCode: { type: String, unique: true }, // Custom Sequential ID
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    userDiscount: { type: Number, default: 0, min: 0, max: 100 },
    role: {
      type: String,
      enum: ["user", "wholesaler", "admin"], // 🔑 roles for access control
      default: "user",
    },

    isVerified: { type: Boolean, default: false },

    otp: { type: String },
    otpExpiry: { type: Date },

    image:{type:String},
    // optional extras
    // 👇 Added new fields
    phone: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: { type: Date },
    // structured address
    address: {
      apartment: { type: String },
      landmark: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
    },
    // in models/User.js (add fields)
    avatarUrl: { type: String },
    avatarPublicId: { type: String },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);
// Generate sequential User ID
userSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  this.userCode = await generateSequentialId("User", "USR");
  next();
});
const User = mongoose.model("User", userSchema);

export default User;
