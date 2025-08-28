import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// route imports
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user/getuser.js";
import doctorRoutes from "./routes/doctor/doctorRoutes.js";
import appointmentRoutes from "./routes/doctor/appointmentRoutes.js"
import cartRoutes from "./routes/products/cartRoutes.js"
import orderRoutes from "./routes/products/orderRoutes.js"
import productRoutes from "./routes/products/productRoutes.js"


dotenv.config();

const app = express();

// connect DB
connectDB();

// middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/get", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments",appointmentRoutes)
app.use("/api/products",productRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/orders",orderRoutes)

app.get("/", (req, res) => {
  res.send("hey there");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
