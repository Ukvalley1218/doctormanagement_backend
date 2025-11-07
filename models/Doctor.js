import mongoose from "mongoose";
import { generateSequentialId } from "../utils/generateId.js";

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    doctorId: { type: String, unique: true }, // Custom Sequential ID
    name: { type: String },
    image: { type: String },
    specialty: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, default: 0 },
    bio: { type: String },
    consultationFee: { type: Number },
    number: { type: Number },
    calendlyUrl: { type: String },
    email: { type: String },
    
    imagePublicId: { type: String },

    // 🩺 New Fields for Doctor Info Section
    about: {
      type: String,
      trim: true,
      default:
        "This doctor is highly experienced and offers exceptional patient care in their field of expertise.",
    },
    services: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      trim: true,
    },
    qualifications: {
      type: String,
      trim: true,
    },

    // Product Status
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // ⭐ Reviews
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: { type: String },
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
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // new fileds
    website: {type:String},
    address: {type:String},
    
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

