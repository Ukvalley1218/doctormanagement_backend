import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import Doctor from "../../models/Doctor.js";


export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count orders for this user
    const ordersCount = await Order.countDocuments({ userId });

    // Count total products in DB
    const productsCount = await Product.countDocuments();

    // count total doctors in db
    const doctorsCount = await Doctor.countDocuments();

    res.json({
      ordersCount,
      productsCount,
      doctorsCount
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};