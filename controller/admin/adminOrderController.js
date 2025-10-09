import Order from "../../models/Order.js";

// @desc Get all orders (with filters)
// export const getAllOrders = async (req, res) => {
//   try {
//     const { status, userId } = req.query;
//     let query = {};

//     if (status) query.orderStatus = status;
//     if (userId) query.userId = userId;

//     const orders = await Order.find(query)
//       .populate("userId", "name email")
//       .populate("items.productId", "name category brand");

//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// export const getAllOrders = async (req, res) => {
//   try {
//     const { status, userId, page = 1, limit = 10 } = req.query;
//     let query = {};

//     if (status) query.orderStatus = status;
//     if (userId) query.userId = userId;

//     const skip = (Number(page) - 1) * Number(limit);

//     const [orders, total] = await Promise.all([
//       Order.find(query)
//         .populate("userId", "name email")
//         .populate("items.productId", "name category brand")
//         .sort({ createdAt: -1 }) // ✅ sort recent first
//         .skip(skip)
//         .limit(Number(limit)),
//       Order.countDocuments(query),
//     ]);

//     res.json({
//       page: Number(page),
//       limit: Number(limit),
//       totalItems: total,
//       totalPages: Math.ceil(total / limit),
//       items: orders,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

export const getAllOrders = async (req, res) => {
  try {
    const { status, userId, search = "", page = 1, limit = 10 } = req.query;

    // --- Base query ---
    let query = {};
    if (status) query.orderStatus = status;
    if (userId) query.userId = userId;

    // --- Search filter ---
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "items.name": { $regex: search, $options: "i" } },
        { "shippingDetails.name": { $regex: search, $options: "i" } },
        { "shippingDetails.city": { $regex: search, $options: "i" } },
        { "shippingDetails.state": { $regex: search, $options: "i" } },
        { "shippingDetails.phone": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    // --- Get paginated & filtered data ---
    const [orders, totalFiltered] = await Promise.all([
      Order.find(query)
        .populate("userId", "name email")
        .populate("items.productId", "name category brand")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    // --- Summary counts (global) ---
    const [totalOrders, completedOrders, pendingOrders, cancelledOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "Delivered" }),
      Order.countDocuments({
        orderStatus: { $in: ["Placed", "Confirmed", "Shipped", "Out For Delivery"] },
      }),
      Order.countDocuments({ orderStatus: { $in: ["Cancelled", "Returned"] } }),
    ]);

    // --- Total Revenue (exclude cancelled/returned) ---
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ["Cancelled", "Returned"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // --- Final response ---
    res.json({
      summary: {
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalRevenue,
      },
      filteredCount: totalFiltered,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalFiltered / limit),
      orders,
    });
  } catch (err) {
    console.error("❌ getAllOrders Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// @desc Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      // .populate("userId", "name email")
      .populate("items.productId", "name category brand");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Update order status + tracking history
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, location } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = status;
    order.trackingHistory.push({ status, note, location });

    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Manage return requests (approve, reject, refund)
export const updateReturnStatus = async (req, res) => {
  try {
    const { productId, returnStatus, reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    const returnItem = order.returnHistory.find(
      (r) => r.productId.toString() === productId
    );
    console.log(returnItem);
    if (!returnItem) {
      return res.status(404).json({ message: "Return request not found" });
    }

    returnItem.status = returnStatus;
    if (reason) returnItem.reason = reason;

    await order.save();
    res.json({ message: "Return status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Delete an order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
