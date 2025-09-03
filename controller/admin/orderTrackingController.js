import Order from "../../models/Order.js";


/**
 * ✅ Update order status (Admin)
 * Example: Placed → Confirmed → Shipped → Delivered
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note, location } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // push status in tracking history
    order.trackingHistory.push({
      status,
      note,
      location,
    });

    // also update current status
    order.orderStatus = status;

    await order.save();

    res.json({
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * ✅ Get tracking history of an order
 */
export const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).select(
      "orderId userId orderStatus trackingHistory"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * ✅ Mark returned product tracking (Admin)
 * If customer returned item → Admin approves → add timeline entry
 */
export const updateReturnTracking = async (req, res) => {
  try {
    const { orderId, productId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const item = order.items.find(
      (i) => i.productId.toString() === productId
    );

    if (!item || item.status !== "returned") {
      return res
        .status(400)
        .json({ message: "Product is not marked as returned" });
    }

    // Push return tracking
    order.trackingHistory.push({
      status: "Returned",
      note: `Product ${item.name} has been returned`,
      
    });

    await order.save();

    res.json({
      message: "Return tracking updated",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};