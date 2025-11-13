import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import Cart from "../../models/Cart.js";
import PDFDocument from "pdfkit";
import Promocode from "../../models/Promocode.js";
import Setting from "../../models/Setting.js";
import Stripe from "stripe";
import fs from "fs";
import path from "path";




// Place an order
// export const placeOrder = async (req, res) => {
//   try {
//     const {
//       session_id,
//       shippingDetails,
//       totalPrice,
//       deliverfee,
//       productValue,
//       discountAmount,
//       taxRate,
//       taxAmount,
//       promoCode, // 👈 added
//     } = req.body;

//     if (!session_id) {
//       return res.status(400).json({ message: "Session ID is required" });
//     }

//     // Find cart
//     const cart = await Cart.findOne({ sessionId: session_id }).populate("items.productId");
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     // Check stock
//     for (let item of cart.items) {
//       if (item.quantity > item.productId.stock) {
//         return res.status(400).json({ message: `${item.productId.name} is out of stock` });
//       }
//     }

//     // ✅ Create order
//     const order = new Order({
//       userId: req.user.id,
//       items: cart.items.map((i) => ({
//         productId: i.productId._id,
//         name: i.productId.name,
//         description: i.description,
//         image: i.image,
//         price: i.productId.actualPrice,
//         quantity: i.quantity,
//       })),
//       totalPrice,
//       deliverfee,
//       productValue,
//       discountAmount,
//       taxRate,
//       taxAmount,
//       shippingDetails,
//       paymentStatus: "successful",
//       orderStatus: "Placed",
//       promoCode: promoCode ? promoCode.toUpperCase() : null, // 👈 save code if used
//       trackingHistory: [
//         { status: "Placed", note: "Order created successfully" },
//       ],
//     });

//     await order.save();

//     // ✅ Deduct stock
//     for (let item of cart.items) {
//       await Product.findByIdAndUpdate(item.productId._id, {
//         $inc: { stock: -item.quantity },
//       });
//     }

//     // ✅ Handle promo code usage
//     if (promoCode) {
//       const promo = await Promocode.findOne({ code: promoCode.toUpperCase() });
//       if (promo) {
//         promo.usedCount += 1;

//         if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
//           promo.isActive = false;
//         }

//         await promo.save();
//       }
//     }

//     // ✅ Clear cart
//     await Cart.findOneAndDelete({ sessionId: session_id });

//     res.status(201).json({ message: "Order placed successfully", order });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// create payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) return res.status(400).json({ message: "Amount required" });

    // Fetch settings (stripe keys)
    const setting = await Setting.findOne();
    const stripe = new Stripe(setting.stripekey);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: setting.stripecurrency || "usd",
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    res.status(500).json({ message: "Stripe payment error", error: err.message });
  }
};

export const placeOrder = async (req, res) => {
  try {
    const {
      session_id,
      shippingDetails,
      totalPrice,
      deliverfee,
      productValue,
      discountAmount,
      taxRate,
      taxAmount,
      promoCode,
      paymentMode, // COD or ONLINE
      stripePaymentIntentId,
      stripePaymentStatus,
      paymentDetails,
    } = req.body;

    if (!session_id) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const cart = await Cart.findOne({ sessionId: session_id }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Stock check...
    for (let item of cart.items) {
      if (item.quantity > item.productId.stock) {
        return res.status(400).json({ message: `${item.productId.name} is out of stock` });
      }
    }

    // ⬇️ INSERT PAYMENT TYPE & STRIPE INFO
    const order = new Order({
      userId: req.user.id,
      items: cart.items.map((i) => ({
        productId: i.productId._id,
        name: i.productId.name,
        description: i.description,
        image: i.image,
        price: i.productId.sellingPrice,
        quantity: i.quantity,
      })),
      totalPrice,
      deliverfee,
      productValue,
      discountAmount,
      taxRate,
      taxAmount,
      shippingDetails,
      paymentStatus: paymentMode === "COD" ? "pending" : "successful",
      orderStatus: "Placed",
      promoCode: promoCode ? promoCode.toUpperCase() : null,

      // Stripe fields
      paymentMode,
      stripePaymentIntentId: stripePaymentIntentId || null,
      stripePaymentStatus: stripePaymentStatus || null,
      paymentDetails: paymentDetails || null,

      trackingHistory: [
        { status: "Placed", note: "Order created successfully" },
      ],
    });

    await order.save();

    // deduct stock, promo update, clear cart...
        // ✅ Deduct stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // ✅ Handle promo code usage
    if (promoCode) {
      const promo = await Promocode.findOne({ code: promoCode.toUpperCase() });
      if (promo) {
        promo.usedCount += 1;

        if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
          promo.isActive = false;
        }

        await promo.save();
      }
    }

    // ✅ Clear cart
    await Cart.findOneAndDelete({ sessionId: session_id });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// Get my orders
// export const getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ userId: req.user.id })
//       .populate({
//         path: "items.productId",
//         model: "Product",
//       })
//       .sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
export const getMyOrders = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query; // default page=1, limit=10
    page = parseInt(page);
    limit = parseInt(limit);

    // total count
    const totalOrders = await Order.countDocuments({ userId: req.user.id });

    // find orders with pagination
    const orders = await Order.find({ userId: req.user.id })
      .populate({
        path: "items.productId",
        model: "Product",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalOrders,
      page,
      totalPages: Math.ceil(totalOrders / limit),
      orders,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// get order by id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find order by ID and ensure it belongs to the logged-in user
    const order = await Order.findOne({ _id: id }).populate({
      path: "items.productId",
      model: "Product", // full product details
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Return a specific product from an order
export const returnProduct = async (req, res) => {
  try {
    const { orderId, productId, reason } = req.body; // productIds = [id1, id2, ...]

    if (!Array.isArray(productId) || productId.length === 0) {
      return res
        .status(400)
        .json({ message: "Product IDs are required in array" });
    }

    // find order that belongs to this user
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let updated = false;

    for (let pid of productId) {
      const itemIndex = order.items.findIndex(
        (i) => i.productId.toString() === pid
      );

      if (itemIndex === -1) {
        continue; // skip if product not found in order
      }

      if (order.items[itemIndex].status === "returned") {
        continue; // skip already returned
      }

      // mark item as returned
      order.items[itemIndex].status = "returned";

      // add entry to returnHistory
      order.returnHistory.push({
        productId: pid,
        reason: reason || "Not specified",
        status: "Requested",
      });

      // restore stock
      await Product.findByIdAndUpdate(pid, {
        $inc: { stock: order.items[itemIndex].quantity },
      });

      updated = true;
    }

    if (!updated) {
      return res
        .status(400)
        .json({ message: "No valid products found to return" });
    }

    // save order (with updated statuses)
    await order.save();

    res.json({ message: "return request submitted successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // if already cancelled
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    let updated = false;

    // cancel each item
    for (let item of order.items) {
      if (item.status !== "Cancelled" && item.status !== "Returned") {
        item.status = "Cancelled";

        // restore stock for cancelled product
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });

        updated = true;
      }
    }

    if (!updated) {
      return res.status(400).json({ message: "No items available to cancel" });
    }

    // update global status
    order.orderStatus = "Cancelled";

    // add to tracking history
    order.trackingHistory.push({
      status: "Cancelled",
      note: "Order cancelled by user/admin",
    });

    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId }).populate(
      "items.productId userId"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // use this if you want to  store invoices in your folder
    // const invoiceDir = path.join(process.cwd(), "invoices");
    // if (!fs.existsSync(invoiceDir)) {
    //   fs.mkdirSync(invoiceDir);
    // }

    // const invoicePath = path.join(invoiceDir, `invoice-${order.orderId}.pdf`);

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderId}.pdf`
    );

    // doc.pipe(fs.createWriteStream(invoicePath));
    doc.pipe(res);

    // 🔹 Header with Logo & Shop Name
    doc.image("public/logo.png", 50, 40, { width: 80 }); // add your shop logo

    doc.moveDown(2);

    // Line separator
    doc.moveTo(40, 90).lineTo(550, 90).stroke();

    // 🔹 Invoice Info
    doc.fontSize(14).text("INVOICE", { align: "right" });
    doc.moveDown();
    doc
      .fontSize(10)
      .text(`Invoice No: ${order.orderId}`, { align: "right" })
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, {
        align: "right",
      });

    doc.moveDown(2);

    // 🔹 Shipping Details
    doc.fontSize(12).text("Shipping Address:", 40);
    doc
      .fontSize(10)
      .text(`${order.shippingDetails.name}`)
      .text(`${order.shippingDetails.address}, ${order.shippingDetails.city}`)
      .text(`${order.shippingDetails.state}, ${order.shippingDetails.zip}`)
      .text(`Phone: ${order.shippingDetails.phone}`);
    doc.moveDown(4);

    // 🔹 Order Items Table (like Amazon/Flipkart)
    const tableTop = 220;
    const itemX = 50;
    const qtyX = 300;
    const priceX = 360;
    const totalX = 450;

    doc.fontSize(12).text("Item", itemX, tableTop);
    doc.text("Qty", qtyX, tableTop);
    doc.text("Price", priceX, tableTop);
    doc.text("Total", totalX, tableTop);

    doc
      .moveTo(40, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    let y = tableTop + 25;

    order.items.forEach((item, index) => {
      const total = item.price * item.quantity;
      doc
        .fontSize(10)
        .text(item.productId?.name || "Product", itemX, y)
        .text(item.quantity, qtyX, y)
        .text(`$${item.price}`, priceX, y)
        .text(`$${total}`, totalX, y);
      y += 20;
    });

    doc.moveDown(3);

    // 🔹 Totals Section (right-aligned like Amazon)
    const summaryTop = y + 20;
    doc.fontSize(12).text("Summary", 380, summaryTop);
    const province = order.shippingDetails?.state || "Ontario";
    const taxRate = order.taxRate || 13; // fallback to Ontario
    const taxAmount = order.taxAmount || ((order.productValue * taxRate) / 100);

    doc
      .fontSize(10)
      .text(`Product Value: $${order.productValue.toFixed(2)}`, 380, summaryTop + 20)
      .text(`Delivery Charges: $${order.deliverfee.toFixed(2)}`, 380, summaryTop + 40)
      .text(`Discount: -$${Number(order.discountAmount || 0).toFixed(2)}`, 380, summaryTop + 60)
      .text(`${province} Tax (${taxRate}%): $${taxAmount.toFixed(2)}`, 380, summaryTop + 80)
      .font("Helvetica-Bold")
      .text(
        `Grand Total: $${order.totalPrice.toFixed(2)}`,
        380,
        summaryTop + 100
      )
      .font("Helvetica");
    

    // 🔹 Footer
    doc.moveDown(4);
    doc.fontSize(10).text("Thank you for shopping with HealCure!", {
      align: "center",
    });
    doc
      .fontSize(8)
      .text(
        "This is a system generated invoice and does not require a signature.",
        {
          align: "center",
        }
      );

    doc.end();
  } catch (err) {
    console.error("Invoice Error:", err);
    res
      .status(500)
      .json({ message: "Error generating invoice", error: err.message });
  }
};
