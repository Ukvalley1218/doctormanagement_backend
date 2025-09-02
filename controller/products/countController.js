import Order from "../../models/Order.js";
import Product from "../../models/Product.js";


export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count orders for this user
    const ordersCount = await Order.countDocuments({ userId });

    // Count total products in DB
    const productsCount = await Product.countDocuments();

    res.json({
      ordersCount,
      productsCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};