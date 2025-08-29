// // controllers/cart/cartController.js
// import Cart from "../../models/Cart.js";
// import Product from "../../models/Product.js";

// // Get user's cart
// export const getCart = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId");
//     res.json(cart || { userId: req.user.id, items: [] });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Add item to cart
// // export const addToCart = async (req, res) => {
// //   try {
// //     const { productId, quantity } = req.body;
// //     let cart = await Cart.findOne({ userId: req.user.id });

// //     if (!cart) {
// //       cart = new Cart({ userId: req.user.id, items: [] });
// //     }

// //     const existingItem = cart.items.find(i => i.productId.toString() === productId);

// //     if (existingItem) {
// //       existingItem.quantity += quantity;
// //     } else {
// //       cart.items.push({ productId, quantity });
// //     }

// //     await cart.save();
// //     res.json(cart);
// //   } catch (err) {
// //     res.status(500).json({ message: "Server error", error: err.message });
// //   }
// // };

// export const addToCart = async (req, res) => {
//   try {
//     const { items ,session_id} = req.body; // Expect an array of items
//     let cart = await Cart.findOne({ userId: req.user.id });

//     if (!cart) {
//       cart = new Cart({ userId: req.user.id, items: [] });
//     }

//     // Loop through each item in the request body
//     for (const newItem of items) {
//       const { productId, quantity } = newItem;

//       // Find if the product already exists in the cart
//       const existingItem = cart.items.find(
//         (i) => i.productId.toString() === productId
//       );

//       if (existingItem) {
//         // If it exists, update the quantity
//         existingItem.quantity += quantity;
//       } else {
//         // If not, add a new item
//         cart.items.push({ productId, quantity });
//       }
//     }

//     await cart.save();
//     res.json(cart);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Remove item from cart
// export const removeFromCart = async (req, res) => {
//   try {
//     const { productId } = req.body;
//     let cart = await Cart.findOne({ userId: req.user.id });

//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     cart.items = cart.items.filter(i => i.productId.toString() !== productId);

//     await cart.save();
//     res.json(cart);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };





import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";

// Get cart by session_id
// export const getCart = async (req, res) => {
//   try {
//     const { session_id } = req.body; // or from query / headers
//     if (!session_id) return res.status(400).json({ message: "Session ID is required" });

//     const cart = await Cart.findOne({ sessionId: session_id }).populate("items.productId");
//     res.json(cart || { sessionId: session_id, items: [] });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

export const getCart = async (req, res) => {

  try {

    const session_id = req.query.session_id || req.headers["session-id"];

    if (!session_id) {

      return res.status(400).json({ message: "Session ID is required" });

    }



    const cart = await Cart.findOne({ sessionId: session_id }).populate("items.productId");

    res.json(cart || { sessionId: session_id, items: [] });

  } catch (err) {

    res.status(500).json({ message: "Server error", error: err.message });

  }

};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { items, session_id } = req.body;
    if (!session_id) return res.status(400).json({ message: "Session ID is required" });

    let cart = await Cart.findOne({ sessionId: session_id });
    if (!cart) {
      cart = new Cart({ sessionId: session_id, items: [] });
    }

    for (const newItem of items) {
      const { productId, quantity } = newItem;
      const existingItem = cart.items.find(
        (i) => i.productId.toString() === productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId, session_id } = req.body;
    if (!session_id) return res.status(400).json({ message: "Session ID is required" });

    let cart = await Cart.findOne({ sessionId: session_id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.productId.toString() !== productId);

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

