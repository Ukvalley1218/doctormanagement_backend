import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import Cart from "../../models/Cart.js";


//Place an order
export const placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check stock
    for (let item of cart.items) {
      if (item.quantity > item.productId.stock) {
        return res.status(400).json({ message: `${item.productId.name} is out of stock` });
      }
    }

    // Create order
    const order = new Order({
      userId: req.user.id,
      items: cart.items.map(i => ({
        productId: i.productId._id,
        quantity: i.quantity,
        price: i.productId.price
      })),
      shippingDetails: req.body.shippingDetails,
      paymentStatus: "successful"  // can integrate Stripe/Razorpay later
    });

    await order.save();

    // Update stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//Get my orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate("items.productId");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



