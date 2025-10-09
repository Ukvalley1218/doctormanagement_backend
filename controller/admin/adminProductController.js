import Product from "../../models/Product.js";

// @desc Create new product
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
};

// @desc Get all products (with filters)
// export const getProducts = async (req, res) => {
//   try {
//     const { category, brand, minPrice, maxPrice } = req.query;
//     let query = {};

//     if (category) query.category = category;
//     if (brand) query.brand = brand;
//     if (minPrice || maxPrice) {
//       query.sellingPrice = {};
//       if (minPrice) query.sellingPrice.$gte = Number(minPrice);
//       if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
//     }

//     const products = await Product.find(query);
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// export const getProducts = async (req, res) => {
//   try {
//     const { category, brand, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

//     let query = {};

//     if (category) query.category = category;
//     if (brand) query.brand = brand;
//     if (minPrice || maxPrice) {
//       query.sellingPrice = {};
//       if (minPrice) query.sellingPrice.$gte = Number(minPrice);
//       if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
//     }

//     const skip = (Number(page) - 1) * Number(limit);

//     const [products, total] = await Promise.all([
//       Product.find(query).skip(skip).limit(Number(limit)),
//       Product.countDocuments(query)
//     ]);

//     res.json({
//       page: Number(page),
//       limit: Number(limit),
//       totalItems: total,
//       totalPages: Math.ceil(total / limit),
//       items: products,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

export const getProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      search = "",
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    // 🔹 Filters
    if (category) query.category = category;
    if (brand) query.brand = brand;

    // 🔹 Price range
    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
    }

    // 🔹 Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    // 🔹 Get paginated products & total count
    const [products, totalFiltered] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    // 🔹 Summary (global, not affected by search/pagination)
    const [totalMedicines, inStock, lowStock, categoriesData] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ stock: { $gt: 0 } }),
      Product.countDocuments({ stock: { $lte: 10 } }), // threshold = 10
      Product.distinct("category"),
    ]);

    // 🔹 Response
    res.json({
      summary: {
        totalMedicines,
        inStock,
        lowStock,
        categories: categoriesData.length,
      },
      filteredCount: totalFiltered,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalFiltered / limit),
      items: products,
    });
  } catch (err) {
    console.error("❌ getProducts Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// @desc Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
};

// @desc Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};