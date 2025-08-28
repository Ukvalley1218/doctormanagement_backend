import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String,},

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    

    role: {
      type: String,
      enum: ["user", "doctor", "admin"], // 🔑 roles for access control
      default: "user",
    },

    isVerified: { type: Boolean, default: false },

    otp: { type: String },
    otpExpiry: { type: Date },

    // optional extras
    phone: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

const User = mongoose.model("User", userSchema);

export default User;
