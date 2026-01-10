import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    slug: { type: String, required: true, unique: true },

    category: {
      type: String,
      enum: ["Body Therapy", "Beauty & Grooming", "Medical Wellness", "Relaxation"],
      required: true,
      index: true,
    },

    shortDescription: { type: String },
    fullDescription: { type: String },

    priceFrom: Number,
    priceTo: Number,

    durationMinutes: Number,

    image: {
      url: String,
      publicId: String,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
