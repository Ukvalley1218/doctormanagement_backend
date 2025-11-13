import Stripe from "stripe";
import Order from "../../models/Order.js";
import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import Setting from "../../models/Setting.js";




// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

// export const createOrderAndPayment = async (req, res) => {
//   try {
//     const { session_id, shippingDetails, deliverfee = 0, discountAmount = 0 } = req.body;
//     if (!session_id) return res.status(400).json({ message: "Session ID is required" });

//     // load cart
//     const cart = await Cart.findOne({ sessionId: session_id }).populate("items.productId");
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     // calculate totals
//     const productValue = cart.items.reduce((sum, item) => sum + item.productId.sellingPrice * item.quantity, 0);
//     const totalPrice = productValue + deliverfee - discountAmount;

//     // create order in DB with pending payment
//     const order = new Order({
//       userId: req.user.id,
//       items: cart.items.map(i => ({
//         productId: i.productId._id,
//         name: i.productId.name,
//         price: i.productId.sellingPrice,
//         quantity: i.quantity
//       })),
//       totalPrice,
//       deliverfee,
//       productValue,
//       discountAmount,
//       shippingDetails,
//       paymentStatus: "pending",
//       orderStatus: "Placed",
//       trackingHistory: [{ status: "Placed", note: "Order created, awaiting payment" }]
//     });

//     await order.save();

//     // Stripe PaymentIntent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(totalPrice * 100),
//       currency: process.env.STRIPE_CURRENCY || "inr",
//       metadata: { orderId: order._id.toString(), orderCode: order.orderId }
//     });

//     // save stripe details
//     order.stripePaymentIntentId = paymentIntent.id;
//     order.stripePaymentStatus = paymentIntent.status;
//     await order.save();

//     res.status(201).json({
//       message: "Order created, payment initiated",
//       orderId: order._id,
//       orderCode: order.orderId,
//       clientSecret: paymentIntent.client_secret
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };



// export const createOrderAndPayment = async (req, res) => {
//   try {
//     const { session_id, shippingDetails, deliverfee, discountAmount ,totalPrice,productValue} = req.body;
//     if (!session_id) return res.status(400).json({ message: "Session ID is required" });

//     // 👉 Get Stripe keys from DB
//     const setting = await Setting.findOne();
//     if (!setting || !setting.stripekey) {
//       return res.status(500).json({ message: "Stripe configuration missing" });
//     }

//     const stripe = new Stripe(setting.stripekey, { apiVersion: "2022-11-15" });

//     // load cart
//     const cart = await Cart.findOne({ sessionId: session_id }).populate("items.productId");
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     // calculate totals
//     // const productValue = cart.items.reduce(
//     //   (sum, item) => sum + item.productId.sellingPrice * item.quantity,
//     //   0
//     // );
//     // const totalPrice = productValue + deliverfee - discountAmount;

//     // create order
//     const order = new Order({
//       userId: req.user.id,
//       items: cart.items.map(i => ({
//         productId: i.productId._id,
//         name: i.productId.name,
//         price: i.productId.sellingPrice,
//         quantity: i.quantity
//       })),
//       totalPrice,
//       deliverfee,
//       productValue,
//       discountAmount,
//       shippingDetails,
//       paymentStatus: "pending",
//       orderStatus: "Placed",
//       trackingHistory: [{ status: "Placed", note: "Order created, awaiting payment" }]
//     });

//     await order.save();

//     // Stripe PaymentIntent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(totalPrice * 100),
//       currency: setting.stripecurrency || "inr", // you can also add currency in DB
//       metadata: { orderId: order._id.toString(), orderCode: order.orderId }
//     });

//     order.stripePaymentIntentId = paymentIntent.id;
//     order.stripePaymentStatus = paymentIntent.status;
//     await order.save();

//     res.status(201).json({
//       message: "Order created, payment initiated",
//       orderId: order._id,
//       orderCode: order.orderId,
//       clientSecret: paymentIntent.client_secret,
//       publishableKey: setting.stripepublishablekey // 👈 send to frontend
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

export const createOrderAndPayment = async (req, res) => {
  try {
    const { session_id, shippingDetails, deliverfee, discountAmount, totalPrice, productValue } = req.body;
    if (!session_id) return res.status(400).json({ message: "Session ID is required" });

    // 👉 Get Stripe keys from DB
    const setting = await Setting.findOne();
    if (!setting || !setting.stripekey) {
      return res.status(500).json({ message: "Stripe configuration missing" });
    }

    const stripe = new Stripe(setting.stripekey, { apiVersion: "2022-11-15" });

    // load cart
    const cart = await Cart.findOne({ sessionId: session_id }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // ✅ Create order in DB (payment still pending)
    const order = new Order({
      userId: req.user.id,
      items: cart.items.map(i => ({
        productId: i.productId._id,
        name: i.productId.name,
        price: i.productId.sellingPrice,
        quantity: i.quantity
      })),
      totalPrice,
      deliverfee,
      productValue,
      discountAmount,
      shippingDetails,
      paymentStatus: "pending",
      orderStatus: "Placed",
      trackingHistory: [{ status: "Placed", note: "Order created, awaiting payment" }]
    });
    await order.save();

    // ✅ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cart.items.map(i => ({
        price_data: {
          currency: setting.stripecurrency || "inr",
          product_data: {
            name: i.productId.name,
          },
          unit_amount: Math.round(i.productId.sellingPrice * 100),
        },
        quantity: i.quantity,
      })),
      mode: "payment",
      success_url: `https://doctor.valleyhoster.com/checkout-success`,
      cancel_url: `https://doctor.valleyhoster.com/apointment-success`,
      metadata: {
        orderId: order._id.toString(),
        orderCode: order.orderId,
      },
    });

    // Save session id in order
    order.stripeSessionId = session.id;
    await order.save();

    res.status(201).json({
      message: "Order created, checkout session initiated",
      orderId: order._id,
      orderCode: order.orderId,
      sessionId: session.id,
      checkoutUrl: session.url, // 👈 frontend can redirect directly
      publishableKey: setting.stripepublishablekey,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = Stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object;
      const order = await Order.findOne({ stripePaymentIntentId: pi.id });
      if (order) {
        order.paymentStatus = "successful";
        order.stripePaymentStatus = pi.status;
        order.paymentDetails = pi;
        order.orderStatus = "Confirmed";
        order.trackingHistory.push({ status: "Confirmed", note: "Payment succeeded" });

        // Deduct stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }

        // Clear cart
        await Cart.findOneAndDelete({ userId: order.userId });

        await order.save();
      }
    }
    res.json({ received: true });
  } catch (err) {
    res.status(500).send();
  }
};



export const createCheckoutSession = async (req, res) => {
  try {
    console.log("CREATE CHECKOUT SESSION REQ BODY:", JSON.stringify(req.body).slice(0, 2000));
    const { amount, orderData } = req.body;

    if (typeof amount === "undefined" || amount === null) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const settings = await Setting.findOne();
    if (!settings) {
      return res.status(500).json({ message: "Stripe settings not configured" });
    }

    // sanitize currency (strip stray quotes if any)
    let currency = (settings.stripecurrency || "inr").toString().trim();
    currency = currency.replace(/^"+|"+$/g, "").toLowerCase();

    const stripe = new Stripe(settings.stripekey);

    const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

    // Ensure orderData exists to avoid undefined errors
    // Ensure orderData exists
const od = orderData || {};

// 🔥 Fix weird hash-format inputs (Stripe error source)
const safeItems = Array.isArray(od.items)
  ? od.items
  : Object.values(od.items || {});

// Metadata
const metadata = {
  promoCode: String(od.promoCode || ""),
  productValue: String(od.productValue ?? 0),
  discountAmount: String(od.discountAmount ?? 0),
  taxAmount: String(od.taxAmount ?? 0),
  deliverfee: String(od.deliverfee ?? 0),
  totalPrice: String(od.totalPrice ?? 0),

  // 🔥 now always a clean JSON array
  items: JSON.stringify(safeItems),

  shippingDetails: JSON.stringify(od.shippingDetails || {}),
};


    console.log("METADATA SENT TO STRIPE = ", metadata);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: "Healcure Order Payment",
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout-cancel`,
      metadata,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("createCheckoutSession error:", err && err.stack ? err.stack : err);
    return res.status(500).json({
      message: "Stripe session error",
      error: err && err.message ? err.message : String(err),
    });
  }
};


export const getCheckoutSession = async (req, res) => {
  try {
    const { session_id } = req.params;

    const settings = await Setting.findOne();
    const stripe = new Stripe(settings.stripekey);

    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.json(session);
  } catch (err) {
    res.status(500).json({
      message: "Stripe session fetch error",
      error: err.message,
    });
  }
};



