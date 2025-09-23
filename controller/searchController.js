import Doctor from '../models/Doctor.js';
import Product from '../models/Product.js';

export const searchAll = async (req, res) => {
  try {
    const { q } = req.query; // search query
    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const regex = new RegExp(q, "i"); // case-insensitive

    // Search doctors (name, specialty, location)
    const doctors = await Doctor.find({
      $or: [
        { name: regex },
        { specialty: regex },
        { location: regex },
        { bio: regex },
      ],
      status: "Active",
    }).select("doctorId name specialty location image rating consultationFee");

    // Search products (name, category, brand, description)
    const products = await Product.find({
      $or: [
        { name: regex },
        { category: regex },
        { brand: regex },
        { description: regex },
      ],
      status: "Active",
    }).select("productId name category brand mainImage sellingPrice discountPrice");

    res.json({
      query: q,
      doctors,
      products,
    });
  } catch (err) {
    console.error("Search API error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};