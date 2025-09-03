import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     items: [
//       {
//         productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
//         quantity: Number,
//         price: Number,
//         deliverfee: Number,
//         status: {
//           type: String,
//           enum: ["purchased", "returned"],
//           default: "purchased",
//         },
//       },
//     ],
//     totalPrice: { type: Number },
//     deliverfee: { type: Number ,default:0},
//     productValue:{type:Number},
//     discountAmount:{type:Number},
//     shippingDetails: {
//       name: String,
//       apartment: String,
//       landmark: String,
//       address: String,
//       city: String,
//       state: String,
//       zip: String,
//       phone: String,
//     },
//     paymentStatus: {
//       type: String,
//       enum: ["pending", "successful", "failed"],
//       default: "pending",
//     },
//     orderStatus: {
//       type: String,
//       enum: ["Placed", "Out For Delivery", "Delivered"],
//       default: "Placed",
//     },
//   },
//   { timestamps: true }
// );

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true }, // custom ID like ORD-2024-002
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        // description: String,
        // image: String,
        price: Number,
        quantity: Number,
        status: {
          type: String,
          enum: ["purchased", "returned"],
          default: "purchased",
        },
      },
    ],
    totalPrice: { type: Number },
    deliverfee: { type: Number, default: 0 },
    productValue: { type: Number },
    discountAmount: { type: Number },
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
      enum: [
        "Placed",
        "Confirmed",
        "Shipped",
        "Out For Delivery",
        "Delivered",
        "Returned",
        "Cancelled",
      ],
      default: "Placed",
    },
    trackingHistory: [
      {
        status: {
          type: String,
          enum: [
            "Placed",
            "Confirmed",

            "Shipped",
            "Out For Delivery",
            "Delivered",
            "Returned",
            "Cancelled",
          ],
          required: true,
        },
        note: { type: String }, // optional message for admin
        location: { type: String }, // optional (if courier updates location)
        timestamp: { type: Date, default: Date.now },
      },
      { _id: false },
    ],
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const currentYear = new Date().getFullYear();

  // Find last order of this year
  const lastOrder = await this.constructor
    .findOne(
      { orderId: new RegExp(`^ORD-${currentYear}`) } // matches same year orders
    )
    .sort({ createdAt: -1 });

  let nextNumber = "001"; // default for first order

  if (lastOrder && lastOrder.orderId) {
    const lastNumber = parseInt(lastOrder.orderId.split("-")[2]); // e.g. ORD-2024-002 → 2
    nextNumber = String(lastNumber + 1).padStart(3, "0"); // increment and pad
  }

  this.orderId = `ORD-${currentYear}-${nextNumber}`;
  next();
});

export default mongoose.model("Order", orderSchema);
