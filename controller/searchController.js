import Doctor from '../models/Doctor.js';
import Product from '../models/Product.js';

// export const searchAll = async (req, res) => {
//   try {
//     const { q } = req.query; // search query
//     if (!q || q.trim() === "") {
//       return res.status(400).json({ message: "Search query is required" });
//     }

//     const regex = new RegExp(q, "i"); // case-insensitive

//     // Search doctors (name, specialty, location)
//     const doctors = await Doctor.find({
//       $or: [
//         { name: regex },
//         { specialty: regex },
//         { location: regex },
//         { bio: regex },
//       ],
//       status: "Active",
//     }).select("doctorId name specialty location image rating consultationFee");

//     // Search products (name, category, brand, description)
//     const products = await Product.find({
//       $or: [
//         { name: regex },
//         { category: regex },
//         { brand: regex },
//         { description: regex },
//       ],
//       status: "Active",
//     }).select("productId name category brand mainImage sellingPrice discountPrice");

//     res.json({
//       query: q,
//       doctors,
//       products,
//     });
//   } catch (err) {
//     console.error("Search API error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

export const searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const regex = new RegExp(q, "i");

    // Search doctors
    const doctors = await Doctor.find({
      $or: [
        { name: regex },
        { specialty: regex },
        { location: regex },
        { bio: regex },
      ],
      status: "Active",
    }).select("doctorId name specialty location image rating consultationFee");

    // Search products
    const products = await Product.find({
      $or: [
        { name: regex },
        { category: regex },
        { brand: regex },
        { description: regex },
      ],
      status: "Active",
    }).select("productId name category brand mainImage sellingPrice discountPrice");

    // Rank results manually by relevance
    const sortByRelevance = (items, key) => {
      const lowerQ = q.toLowerCase();
      return items.sort((a, b) => {
        const aName = a[key].toLowerCase();
        const bName = b[key].toLowerCase();

        // 1. Exact match first
        if (aName === lowerQ && bName !== lowerQ) return -1;
        if (bName === lowerQ && aName !== lowerQ) return 1;

        // 2. Prefix match second
        if (aName.startsWith(lowerQ) && !bName.startsWith(lowerQ)) return -1;
        if (bName.startsWith(lowerQ) && !aName.startsWith(lowerQ)) return 1;

        // 3. Shorter words or earlier occurrence next
        return aName.indexOf(lowerQ) - bName.indexOf(lowerQ);
      });
    };

    const sortedDoctors = sortByRelevance(doctors, "name");
    const sortedProducts = sortByRelevance(products, "name");

    res.json({
      query: q,
      doctors: sortedDoctors,
      products: sortedProducts,
    });
  } catch (err) {
    console.error("Search API error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
