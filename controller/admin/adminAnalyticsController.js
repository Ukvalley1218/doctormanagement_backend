import Doctor from "../../models/Doctor.js";
import User from "../../models/User.js";
import Product from "../../models/Product.js";
import Order from "../../models/Order.js";
import mongoose from "mongoose";

// @desc Get overall analytics
export const getAnalytics = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Total income (sum of successful orders)
    const incomeResult = await Order.aggregate([
      { $match: { paymentStatus: "successful" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalIncome = incomeResult[0]?.total || 0;

    // Orders per day (last 30 days)
    const ordersPerDay = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Orders per status
    const ordersPerStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
    ]);

    // Top products (by quantity sold)
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          category: "$product.category",
          totalSold: 1
        }
      }
    ]);

    res.json({
      totals: {
        users: totalUsers,
        doctors: totalDoctors,
        products: totalProducts,
        orders: totalOrders,
        income: totalIncome
      },
      ordersPerDay,
      ordersPerStatus,
      topProducts
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
