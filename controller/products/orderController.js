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
  .populate("productId")
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

    const order = await Order.findOne({ orderId })
      .populate("items.productId userId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const invoiceDir = path.join(process.cwd(), "invoices");
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir);
    }

    const invoicePath = path.join(invoiceDir, `invoice-${order.orderId}.pdf`);

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.orderId}.pdf`);

    doc.pipe(fs.createWriteStream(invoicePath)); 
    doc.pipe(res);

    // 🔹 Header with Logo & Shop Name
    doc.image("public/logo.png", 40, 30, { width: 60 }); // add your shop logo
    doc.fontSize(18).text("Healcure", 110, 35);
    doc.fontSize(10).text("www.HealCure.com", 110, 55);
    doc.moveDown(2);

    // Line separator
    doc.moveTo(40, 90).lineTo(550, 90).stroke();

    // 🔹 Invoice Info
    doc.fontSize(14).text("INVOICE", { align: "right" });
    doc.moveDown();
    doc.fontSize(10)
      .text(`Invoice No: ${order.orderId}`, { align: "right" })
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: "right" });

    doc.moveDown(2);

    // 🔹 Shipping Details
    doc.fontSize(12).text("Shipping Address:", 40);
    doc.fontSize(10)
      .text(`${order.shippingDetails.name}`)
      .text(`${order.shippingDetails.address}, ${order.shippingDetails.city}`)
      .text(`${order.shippingDetails.state}, ${order.shippingDetails.zip}`)
      .text(`Phone: ${order.shippingDetails.phone}`);
    doc.moveDown(2);

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

    doc.moveTo(40, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 25;

    order.items.forEach((item, index) => {
      const total = item.quantity * item.price;
      doc.fontSize(10)
        .text(item.productId?.name || "Product", itemX, y)
        .text(item.quantity, qtyX, y)
        .text(`₹${item.price}`, priceX, y)
        .text(`₹${total}`, totalX, y);
      y += 20;
    });

    doc.moveDown(2);

    // 🔹 Totals Section (right-aligned like Amazon)
    const summaryTop = y + 20;
    doc.fontSize(12).text("Summary", 400, summaryTop);

    doc.fontSize(10)
      .text(`Product Value: ₹${order.productValue}`, 400, summaryTop + 20)
      .text(`Delivery Fee: ₹${order.deliverfee}`, 400, summaryTop + 35)
      .text(`Discount: -₹${order.discountAmount || 0}`, 400, summaryTop + 50);

    doc.fontSize(12).text(`Grand Total: ₹${order.totalPrice}`, 400, summaryTop + 70, {
      bold: true,
    });

    // 🔹 Footer
    doc.moveDown(4);
    doc.fontSize(10).text("Thank you for shopping with DryFruit Hut!", {
      align: "center",
    });
    doc.fontSize(8).text("This is a system generated invoice and does not require a signature.", {
      align: "center",
    });

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
