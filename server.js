import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

// route imports
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user/getuser.js";
import doctorRoutes from "./routes/doctor/doctorRoutes.js";
import appointmentRoutes from "./routes/doctor/appointmentRoutes.js";
import cartRoutes from "./routes/products/cartRoutes.js";
import orderRoutes from "./routes/products/orderRoutes.js";
import productRoutes from "./routes/products/productRoutes.js";
import settingroutes from "./routes/setting/settingroute.js"
import countRoute from "./routes/products/countRoute.js"
import orderTrackingRoute from "./routes/products/orderTrackingRoutes.js"
import uploadRoutes from "./routes/cloudinary/uploadRoutes.js"
import searchRoutes from "./routes/searchRoutes.js";
import formRoute from "./routes/form/formRoute.js"

// admin routes imports
import orderTrackingRoutes from "./routes/admin/orderTrackingRoutes.js"
import adminAuthRoutes from "./routes/admin/adminAuthRoutes.js"
import adminOtpRoutes from "./routes/admin/adminOtpRoutes.js";
import adminUserRoutes from "./routes/admin/adminUserRoutes.js"
import adminProductRoutes from "./routes/admin/adminProductRoutes.js"
import adminDoctorRoutes from "./routes/admin/adminDoctorRoutes.js"
import adminOrderRoutes  from "./routes/admin/adminOrderRoutes.js"
import adminAnalyticsRoutes from "./routes/admin/adminAnalyticsRoutes.js"
import adminExportRoutes from "./routes/admin/adminExportRoutes.js"

// promo code imports
import promoCodeRoutes from "./routes/promocode/promoCodeRoutes.js"
// stripe imports
import paymentRoutes from "./routes/stripe/paymentRoutes.js";
import { stripeWebhookHandler } from "./controller/stripepayment/paymentController.js";

dotenv.config();

const app = express();

// connect DB
connectDB();

// ---------- CORS SETUP ----------
const allowedOrigins = [
  "http://localhost:5173",
  "https://doctor.valleyhoster.com",
  "https://admindoctor.valleyhoster.com",
  "https://admin.healcure.ca",
  "https://healcure.ca",
  "https://www.admin.healcure.ca",
  "https://www.healcure.ca",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow mobile apps/postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies / auth headers
  })
);


// middleware
// app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/form",formRoute);

app.use("/api",countRoute);
app.use("/api/orders",orderTrackingRoute);
app.use("/api/upload", uploadRoutes);


// promo code routes
app.use("/api/promocode",promoCodeRoutes);
// stripe payment routes
app.use("/api/payment", paymentRoutes);
app.post("/api/payment/webhook", express.raw({ type: "application/json" }),stripeWebhookHandler);


// admin routes
app.use("/api/admin/orders",orderTrackingRoutes); 
app.use("/api/admin/auth",adminAuthRoutes);
app.use("/api/admin/otp",adminOtpRoutes);
app.use("/api/admin/users",adminUserRoutes);
app.use("/api/admin/products",adminProductRoutes);
app.use("/api/admin/doctors",adminDoctorRoutes);
app.use("/api/admin/orders",adminOrderRoutes);
app.use("/api/admin/analytics",adminAnalyticsRoutes);
app.use("/api/admin/setting",settingroutes)
app.use("/api/admin/exports",adminExportRoutes);


app.get("/", (req, res) => {
  res.send("hey there");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
