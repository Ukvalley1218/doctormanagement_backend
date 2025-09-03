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


// return prodcut traccking api

// GET /api/user/orders/:orderId/returns
export const getUserReturnTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      
    }).populate("returnHistory.productId", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.returnHistory || order.returnHistory.length === 0) {
      return res.json({ message: "No returns found for this order" });
    }

    res.json({
      orderId: order.orderId,
      returnHistory: order.returnHistory
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

