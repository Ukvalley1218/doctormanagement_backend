import Order from "../../models/Order.js";
import Product from "../../models/Product.js";


/**
 * ✅ Get tracking timeline for a user’s order
 */
export const getUserOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id, // ensure only owner can view
    }).select("orderId orderStatus trackingHistory items");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
