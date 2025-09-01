import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        price: Number,
        deliverfee: Number,
        status: {
          type: String,
          enum: ["purchased", "returned"],
          default: "purchased",
        },
      },
    ],
    totalPrice: { type: Number },
    deliverfee: { type: Number ,default:0},
    shippingDetails: {
      name: String,
      apartment: String,
      landmark: String,
      address: String,
      city: String,
      state: String,
      zip: String,
      phone: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["Placed", "Out For Delivery", "Delivered"],
      default: "Placed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
