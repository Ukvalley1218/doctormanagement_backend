import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import Cart from "../../models/Cart.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Place an order
export const placeOrder = async (req, res) => {
  try {
    const {
      session_id,
      shippingDetails,
      totalPrice,
      deliverfee,
      productValue,
      discountAmount,
    } = req.body;
    if (!session_id) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    // Find cart by session_id
    const cart = await Cart.findOne({ sessionId: session_id }).populate(
      "items.productId"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check stock availability
    for (let item of cart.items) {
      if (item.quantity > item.productId.stock) {
        return res
          .status(400)
          .json({ message: `${item.productId.name} is out of stock` });
      }
    }

    
    
    // Create order linked to logged-in user
    const order = new Order({
      userId: req.user.id,
      items: cart.items.map((i) => ({
        productId: i.productId._id,
        quantity: i.quantity,
        price: i.productId.price,
      })),
      totalPrice,
      deliverfee,
      productValue,
      discountAmount,
      shippingDetails,
      paymentStatus: "successful",
    });

    await order.save(); // ✅ will auto-generate orderId here

    // Deduct stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity },
      });
    }

    await Cart.findOneAndDelete({ sessionId: session_id });

    return res
      .status(201)
      .json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get my orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
  .populate("items.productId")
  .sort({ createdAt: -1 }); // newest first
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Return a specific product from an order
export const returnProduct = async (req, res) => {
  try {
    const { orderId, productId } = req.body;

    // find order
    const order = await Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // find item in order
    const itemIndex = order.items.findIndex(
      (i) => i.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    // mark item as returned
    order.items[itemIndex].status = "returned";

    // restore stock
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: order.items[itemIndex].quantity },
    });

    // remove product from order
    order.items.splice(itemIndex, 1);

    await order.save();

    res.json({ message: "Product returned successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // find order by custom orderId (ORD-2025-001) instead of _id
    const order = await Order.findOne({ orderId }).populate("items.productId userId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // create invoice folder if not exists
    const invoiceDir = path.join(process.cwd(), "invoices");
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir);
    }

    // PDF file path
    const invoicePath = path.join(invoiceDir, `invoice-${order.orderId}.pdf`);

    // setup PDF doc
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.orderId}.pdf`);

    doc.pipe(fs.createWriteStream(invoicePath)); // save on server
    doc.pipe(res); // send to client

    // 🔹 Header
    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice No: ${order.orderId}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    // 🔹 Shipping Details
    doc.fontSize(14).text("Shipping Details:");
    doc.fontSize(12).text(`${order.shippingDetails.name}`);
    doc.text(`${order.shippingDetails.address}, ${order.shippingDetails.city}`);
    doc.text(`${order.shippingDetails.state}, ${order.shippingDetails.zip}`);
    doc.text(`Phone: ${order.shippingDetails.phone}`);
    doc.moveDown();

    // 🔹 Items Table
    doc.fontSize(14).text("Order Items:");
    order.items.forEach((item, index) => {
      const line = `${index + 1}. ${item.productId?.name || "Product"}  -  Qty: ${item.quantity}  x ₹${item.price} = ₹${item.quantity * item.price}`;
      doc.fontSize(12).text(line);
    });

    doc.moveDown();

    // 🔹 Summary
    doc.fontSize(14).text("Summary:");
    doc.fontSize(12).text(`Product Value: ₹${order.productValue}`);
    doc.text(`Delivery Fee: ₹${order.deliverfee}`);
    doc.text(`Discount: ₹${order.discountAmount || 0}`);
    doc.moveDown();
    doc.fontSize(14).text(`Total: ₹${order.totalPrice}`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error("Invoice Error:", err);
    res.status(500).json({ message: "Error generating invoice", error: err.message });
  }
};

// old code

// import Order from "../../models/Order.js";
// import Product from "../../models/Product.js";
// import Cart from "../../models/Cart.js";

// //Place an order
// export const placeOrder = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId");

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     // Check stock
//     for (let item of cart.items) {
//       if (item.quantity > item.productId.stock) {
//         return res.status(400).json({ message: `${item.productId.name} is out of stock` });
//       }
//     }

//     // Create order
//     const order = new Order({
//       userId: req.user.id,
//       items: cart.items.map(i => ({
//         productId: i.productId._id,
//         quantity: i.quantity,
//         price: i.productId.price
//       })),
//       shippingDetails: req.body.shippingDetails,
//       paymentStatus: "successful"  // can integrate Stripe/Razorpay later
//     });

//     await order.save();

//     // Update stock
//     for (let item of cart.items) {
//       await Product.findByIdAndUpdate(item.productId._id, {
//         $inc: { stock: -item.quantity }
//       });
//     }

//     // Clear cart
//     cart.items = [];
//     await cart.save();

//     res.status(201).json({ message: "Order placed successfully", order });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// //Get my orders
// export const getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ userId: req.user.id }).populate("items.productId");
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
