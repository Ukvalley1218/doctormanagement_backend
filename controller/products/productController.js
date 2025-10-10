import User from "../../models/User.js";
import Product from "../../models/Product.js";

// Get all produuucts with filters
// export const getProducts = async (req, res) => {
//   try {
//     const { category, brand, minPrice, maxPrice, search } = req.query;
//     let query = {};

//     if (category) query.category = category;
//     if (brand) query.brand = brand;
//     // price filter
//     if (minPrice || maxPrice) {
//       query.sellingPrice = {};
//       if (minPrice) query.sellingPrice.$gte = Number(minPrice);
//       if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
//     }
//     // search filter (name, description, brand)
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: "i" } }, // case-insensitive
//         { description: { $regex: search, $options: "i" } },
//         { brand: { $regex: search, $options: "i" } },
//       ];
//     }


//     const products = await Product.find(query);
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// export const getProducts = async (req, res) => {
//   try {
//     const { category, brand, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;
//     let query = {};

//     if (category) query.category = category;
//     if (brand) query.brand = brand;

//     // price filter
//     if (minPrice || maxPrice) {
//       query.sellingPrice = {};
//       if (minPrice) query.sellingPrice.$gte = Number(minPrice);
//       if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
//     }

//     // search filter (name, description, brand)
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: "i" } }, // case-insensitive
//         { description: { $regex: search, $options: "i" } },
//         { brand: { $regex: search, $options: "i" } },
//       ];
//     }

//     // convert pagination params
//     const pageNumber = parseInt(page);
//     const limitNumber = parseInt(limit);

//     // total count
//     const totalProducts = await Product.countDocuments(query);

//     // fetch with pagination
//     const products = await Product.find(query)
//       .skip((pageNumber - 1) * limitNumber)
//       .limit(limitNumber);

//     res.json({
//       totalProducts,
//       page: pageNumber,
//       totalPages: Math.ceil(totalProducts / limitNumber),
//       products,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
export const getProducts = async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, search, page = 1, limit = 10, sortBy } = req.query;
    let query = {};

    if (category) query.category = category;
    if (brand) query.brand = brand;

    // price filter
    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
    }

    // search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Sort logic
    let sortOption = {};
    if (sortBy === "Price: Low to High") sortOption = { sellingPrice: 1 };
    else if (sortBy === "Price: High to Low") sortOption = { sellingPrice: -1 };
    else if (sortBy === "Newest") sortOption = { createdAt: -1 };
    else if (sortBy === "Most Popular") sortOption = { soldCount: -1 };

    // total count
    const totalProducts = await Product.countDocuments(query);

    // fetch with pagination + sorting
    const products = await Product.find(query)
      .sort(sortOption)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json({
      totalProducts,
      page: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      products,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//Add new product (Admin only)
export const addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ msg: "products added Successfully", product });
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const addReviews = async (req,res)=>{
  try {
    const {rating,comment}=req.body;
    const {productId}=req.params;

    // find product
    const product =  await Product.findById(productId);
    if(!product){
      return res.status(404).json({msg:"product not found"})
    }


    // check if already reviewd
    const alreadyReviewed = product.reviews.find(
      (r) => r.userId.toString() === req.user.id
    );
    if(alreadyReviewed){
      return res.status(400).json({msg:"you already reviewd this product"})
    }
    // get user details
    const user = await User.findById(req.user.id).select("name");

    // push review
    const review = {
      userId: req.user.id, // from auth middleware
      name:user?.name || "Anonymous",
      rating,
      comment,
      createdAt: new Date(),
    };

    product.reviews.push(review);

    // update average rating
    product.rating =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ msg: "Review added successfully", product });


  } catch (error) {
    res.status(500).json({message:"Error",error:error.message})
  }
}
