import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true }, // e.g. SAVE10
    discountPercentage: { type: Number, required: true }, // e.g. 10 means 10%
    expiryDate: { type: Date, required: true }, // validity period
    isActive: { type: Boolean, default: true }, // toggle by admin
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("PromoCode", promoCodeSchema);