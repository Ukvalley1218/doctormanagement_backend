// // models/Cart.js
// import mongoose from "mongoose";

// const cartSchema = new mongoose.Schema(
//   {
//     userId: { 
//       type: mongoose.Schema.Types.ObjectId, 
//       ref: "User", 
       
//     },
//     session_id:{},
//     items: [
//       {
//         productId: { 
//           type: mongoose.Schema.Types.ObjectId, 
//           ref: "Product", 
//           required: true 
//         },
//         quantity: { 
//           type: Number, 
//           default: 1, 
//           min: 1 
//         }
//       }
//     ]
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Cart", cartSchema);



import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,   // every cart must have a session_id
    index: true,      // makes queries faster
  },
  // (optional) If you still want to link to a logged-in user later:
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Automatically update `updatedAt` on save
cartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
