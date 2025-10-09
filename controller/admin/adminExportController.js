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
      .populate("userId", "email name")
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



// filters for export (e.g., export orders between two dates, or users by role)
// import { Parser } from "json2csv";
// import User from "../models/User.js";
// import Doctor from "../models/Doctor.js";
// import Product from "../models/Product.js";
// import Order from "../models/Order.js";

// const exportToCSV = (res, data, filename) => {
//   try {
//     const parser = new Parser();
//     const csv = parser.parse(data);
//     res.header("Content-Type", "text/csv");
//     res.attachment(`${filename}.csv`);
//     return res.send(csv);
//   } catch (err) {
//     return res.status(500).json({ message: "CSV export failed", error: err.message });
//   }
// };

// // @desc Export Users (filters: role, date range)
// export const exportUsers = async (req, res) => {
//   try {
//     const { role, startDate, endDate } = req.query;

//     const filter = {};
//     if (role) filter.role = role;
//     if (startDate && endDate) {
//       filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     }

//     const users = await User.find(filter).select("-otp -otpExpiry -__v");
//     exportToCSV(res, users, "users");
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // @desc Export Doctors (filters: specialty, location)
// export const exportDoctors = async (req, res) => {
//   try {
//     const { specialty, location } = req.query;

//     const filter = {};
//     if (specialty) filter.specialty = specialty;
//     if (location) filter.location = location;

//     const doctors = await Doctor.find(filter).populate("userId", "email name").select("-__v");
//     exportToCSV(res, doctors, "doctors");
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // @desc Export Products (filters: category, brand)
// export const exportProducts = async (req, res) => {
//   try {
//     const { category, brand } = req.query;

//     const filter = {};
//     if (category) filter.category = category;
//     if (brand) filter.brand = brand;

//     const products = await Product.find(filter).select("-__v");
//     exportToCSV(res, products, "products");
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // @desc Export Orders (filters: status, paymentStatus, date range)
// export const exportOrders = async (req, res) => {
//   try {
//     const { status, paymentStatus, startDate, endDate } = req.query;

//     const filter = {};
//     if (status) filter.orderStatus = status;
//     if (paymentStatus) filter.paymentStatus = paymentStatus;
//     if (startDate && endDate) {
//       filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     }

//     const orders = await Order.find(filter)
//       .populate("userId", "email name")
//       .populate("items.productId", "name category")
//       .select("-__v");

//     const formatted = orders.map((o) => ({
//       orderId: o.orderId,
//       user: o.userId?.name || "N/A",
//       email: o.userId?.email || "N/A",
//       totalPrice: o.totalPrice,
//       paymentStatus: o.paymentStatus,
//       orderStatus: o.orderStatus,
//       createdAt: o.createdAt,
//       updatedAt: o.updatedAt
//     }));

//     exportToCSV(res, formatted, "orders");
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
