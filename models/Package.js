import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },

    description: String,

    services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
      },
    ],

    totalDuration: Number, // in minutes
    regularPrice: Number,
    packagePrice: Number,

    image: {
      url: String,
      publicId: String,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Package", packageSchema);
