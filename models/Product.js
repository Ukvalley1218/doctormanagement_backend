// models/Product.js
import mongoose from "mongoose";
import { generateSequentialId } from "../utils/generateId.js";
// const productSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     category: { type: String, required: true, trim: true },
//     brand: { type: String, trim: true },
//     price: { type: Number, required: true },
//     stock: { type: Number, required: true, default: 0 },
//     description: { type: String, trim: true },

//     // Single main image (thumbnail/cover)
//     mainImage: { type: String },

//     // Gallery images
//     images: [{ type: String }],
//   },
//   { timestamps: true }
// );

// this schema is used when we want to add discounts , actual price and selling price
// const productSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     category: { type: String, required: true, trim: true },
//       productId: { type: String, unique: true }, // Custom Sequential ID
//     brand: { type: String, trim: true },

//     // Pricing
//     actualPrice: { type: Number, required: true }, // MRP
//     sellingPrice: { type: Number, required: true }, // Public selling price
//     discountPrice:{type:Number,default:0,min:0,max:100},

//     stock: { type: Number, required: true, default: 0 },
//     description: { type: String, trim: true },

//     // Single main image (thumbnail/cover)
//     mainImage: { type: String },

//     // Gallery images
//     images: [{ type: String }],

//   },
//   { timestamps: true }
// );
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    productId: { type: String, unique: true }, // Custom Sequential ID
    brand: { type: String, trim: true },

    // Pricing
    actualPrice: { type: Number, required: true }, // MRP
    sellingPrice: { type: Number, required: true }, // Public selling price
    discountPrice: { type: Number, default: 0, min: 0, max: 100 },

    // Stock & Description
    stock: { type: Number, required: true, default: 0 },
    description: { type: String, trim: true },

    // Images
    mainImage: { type: String }, // Thumbnail / Cover
    images: [{ type: String }], // Gallery images

    // Manufacturer & Supplier Details
    countryOfOrigin: { type: String, trim: true },

    // Product Status
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    dosage:{type:String},
    sideeffects:{type:String},
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: { type: String }, // ✅ store user name
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
         createdAt: { type: Date, default: Date.now }, // ✅ add timestamp
      },
      { timestamps: true },
    ],

    // in models/Product.js (add fields next to images)
    mainImagePublicId: { type: String },
    imagesPublicIds: [{ type: String }],
  },
  { timestamps: true }
);

// Generate sequential Product ID
productSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  this.productId = await generateSequentialId("Product", "PRD");
  next();
});
export default mongoose.model("Product", productSchema);

// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     category: { type: String, required: true, trim: true },
//     brand: { type: String, trim: true },

//     // Pricing
//     actualPrice: { type: Number, required: true }, // MRP
//     sellingPrice: { type: Number, required: true }, // Default price for all

//     stock: { type: Number, required: true, default: 0 },
//     description: { type: String, trim: true },

//     // Images
//     mainImage: { type: String },
//     images: [{ type: String }],

//     // Personalized discounts
//     userDiscounts: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         discountPercentage: { type: Number, default: 0 }, // e.g. 10 = 10%
//       },
//     ],
//   },
//   { timestamps: true }
// );

// // 🟢 Instance method to calculate final price for a specific user
// productSchema.methods.getFinalPrice = function (userId) {
//   let price = this.sellingPrice;

//   // Check if user has special discount
//   const discount = this.userDiscounts.find(
//     (ud) => ud.userId.toString() === userId.toString()
//   );

//   if (discount) {
//     price = price - (price * discount.discountPercentage) / 100;
//   }

//   return price;
// };

// export default mongoose.model("Product", productSchema);

// use later
// Personalized discounts (admin can assign per user)
// userDiscounts: [
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     discountPercentage: { type: Number, default: 0 }, // e.g. 10 means 10% off
//     discountPrice: { type: Number }, // store pre-calculated price if needed
//   },
// ],
