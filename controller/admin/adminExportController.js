import { Parser } from "json2csv";
import User from "../../models/User.js";
import Doctor from "../../models/Doctor.js";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";


const exportToCSV = (res, data, filename) => {
  try {
    const parser = new Parser(); // instantiate parser
    const csv = parser.parse(data); // convert JSON → CSV
    res.header("Content-Type", "text/csv");
    res.attachment(`${filename}.csv`);
    return res.send(csv);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "CSV export failed", error: err.message });
  }
};
// @desc Export Users
export const exportUsers = async (req, res) => {
  try {
    const users = await User.find().select("-otp -otpExpiry -__v"); // exclude sensitive
    exportToCSV(res, users, "users");
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Export Doctors
export const exportDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("userId", "email name").select("-__v");
    exportToCSV(res, doctors, "doctors");
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Export Products
export const exportProducts = async (req, res) => {
  try {
    const products = await Product.find().select("-__v");
    exportToCSV(res, products, "products");
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Export Orders
export const exportOrders = async (req, res) => {
  try {
    const orders = await Order.find()
    //   .populate("userId", "email name")
      .populate("items.productId", "name category")
      .select("-__v");

    // Convert to plain JSON
    const formatted = orders.map((o) => ({
      orderId: o.orderId,
      user: o.userId?.name || "N/A",
      email: o.userId?.email || "N/A",
      totalPrice: o.totalPrice,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt
    }));

    exportToCSV(res, formatted, "orders");
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};