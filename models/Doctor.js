import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String },
    image: { type: String },
    specialty: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, default: 0 },
    bio: { type: String },
    rate:{type:Number},
    calendlyLink:{type:String},
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

export default mongoose.model("Doctor", doctorSchema);

