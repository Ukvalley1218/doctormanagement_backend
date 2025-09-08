import mongoose from "mongoose";
import { generateSequentialId } from "../utils/generateId.js";
const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    doctorId: { type: String, unique: true }, // Custom Sequential ID
    name: { type: String },
    image: { type: String },
    specialty: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, default: 0 },
    bio: { type: String },
    consultationFee:{type:Number},
    number:{type:Number},
    calendlyurl:{type:String},
    // Product Status
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          trim: true,
        },
      },
      { timestamps: true },
    ],
    availableSlots: [
  {
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ["available", "confirmed"], default: "available" }
  },
],

  },
  { timestamps: true }
);



// Generate sequential Doctor ID
doctorSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  this.doctorId = await generateSequentialId("Doctor", "DR");
  next();
});
export default mongoose.model("Doctor", doctorSchema);

