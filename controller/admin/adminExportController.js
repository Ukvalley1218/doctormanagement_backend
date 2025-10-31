import { Parser } from "json2csv";
import User from "../../models/User.js";
import Doctor from "../../models/Doctor.js";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";


const exportToCSV = (res, data, filename) => {
  try {
    const parser = new Parser(); // instantiate parser
    const csv = parser.parse(data); // convert JSON → CSV
    res.header("Content-Type", "text/csv");
    res.attachment(`${filename}.csv`);
    return res.send(csv);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "CSV export failed", error: err.message });
  }
};
// @desc Export Users
export const exportUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "userCode name email userDiscount role isVerified phone address image avatarUrl createdAt updatedAt"
      )
      .lean();

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    // Format users for CSV export
    const formattedUsers = users.map((u) => ({
      User_Code: u.userCode,
      Name: u.name || "",
      Email: u.email,
      Role: u.role,
      Verified: u.isVerified ? "Yes" : "No",
      Discount_Percentage: u.userDiscount || 0,
      Phone: u.phone || "",
     
      Apartment: u.address?.apartment || "",
      Landmark: u.address?.landmark || "",
      Street_Address: u.address?.address || "",
      City: u.address?.city || "",
      State: u.address?.state || "",
      ZIP: u.address?.zip || "",
      Profile_Image_URL: u.image || u.avatarUrl || "",
      Created_At: u.createdAt?.toISOString(),
      Updated_At: u.updatedAt?.toISOString(),
    }));

    // Export as CSV
    exportToCSV(res, formattedUsers, "users");
  } catch (err) {
    console.error("Error exporting users:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Export Doctors
export const exportDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("userId", "email name")
      .select(
        "doctorId name image specialty location rating bio consultationFee number calendlyUrl email about services experience qualifications status reviews createdAt updatedAt"
      )
      .lean();

    if (!doctors.length) {
      return res.status(404).json({ message: "No doctors found" });
    }

    // Format doctor data for CSV export
    const formattedDoctors = doctors.map((d) => {
      const totalReviews = d.reviews?.length || 0;
      const avgRating =
        totalReviews > 0
          ? (
              d.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
              totalReviews
            ).toFixed(2)
          : d.rating || 0;

      return {
        Doctor_ID: d.doctorId,
        Name: d.name || d.userId?.name || "",
        Email: d.email || d.userId?.email || "",
        Specialty: d.specialty,
        Location: d.location,
        Rating: avgRating,
        Total_Reviews: totalReviews,
        Consultation_Fee: d.consultationFee || "",
        Contact_Number: d.number || "",
        Calendly_URL: d.calendlyUrl || "",
        Bio: d.bio || "",
        About: d.about || "",
        Services: d.services?.join(", ") || "",
        Experience: d.experience || "",
        Qualifications: d.qualifications || "",
        Status: d.status,
        Image_URL: d.image || "",
        Created_At: d.createdAt?.toISOString(),
        Updated_At: d.updatedAt?.toISOString(),
      };
    });

    // Export as CSV
    exportToCSV(res, formattedDoctors, "doctors");
  } catch (err) {
    console.error("Error exporting doctors:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Export Products
export const exportProducts = async (req, res) => {
  try {
    // Select only relevant fields
    const products = await Product.find()
      .select(
        "productId name category brand actualPrice sellingPrice discountPrice stock description mainImage images countryOfOrigin status dosage sideeffects createdAt updatedAt"
      )
      .lean();

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    // Map data for CSV (flatten nested arrays)
    const formattedProducts = products.map((p) => ({
      Product_ID: p.productId,
      Name: p.name,
      Category: p.category,
      Brand: p.brand,
      Actual_Price: p.actualPrice,
      Selling_Price: p.sellingPrice,
      Discount_Percentage: p.discountPrice,
      Stock: p.stock,
      Description: p.description,
      Main_Image_URL: p.mainImage || "",
      Gallery_Images: p.images?.join(", ") || "",
      Country_Of_Origin: p.countryOfOrigin,
      Status: p.status,
      Dosage: p.dosage || "",
      Side_Effects: p.sideeffects || "",
      Created_At: p.createdAt?.toISOString(),
      Updated_At: p.updatedAt?.toISOString(),
    }));

    // Export as CSV
    exportToCSV(res, formattedProducts, "products");
  } catch (err) {
    console.error("Error exporting products:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// @desc Export Orders
export const exportOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "email name")
      .populate("items.productId", "name category")
      .select("-__v");

    // Convert to plain JSON
    const formatted = orders.map((o) => ({
      orderId: o.orderId,
      user: o.userId?.name || "N/A",
      email: o.userId?.email || "N/A",
      totalPrice: o.totalPrice,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt
    }));

    exportToCSV(res, formatted, "orders");
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// filters for export (e.g., export orders between two dates, or users by role)
// import { Parser } from "json2csv";
// import User from "../models/User.js";
// import Doctor from "../models/Doctor.js";
// import Product from "../models/Product.js";
// import Order from "../models/Order.js";

// const exportToCSV = (res, data, filename) => {
//   try {
//     const parser = new Parser();
//     const csv = parser.parse(data);
//     res.header("Content-Type", "text/csv");
//     res.attachment(`${filename}.csv`);
//     return res.send(csv);
//   } catch (err) {
//     return res.status(500).json({ message: "CSV export failed", error: err.message });
//   }
// };

// // @desc Export Users (filters: role, date range)
// export const exportUsers = async (req, res) => {
//   try {
//     const { role, startDate, endDate } = req.query;

//     const filter = {};
//     if (role) filter.role = role;
//     if (startDate && endDate) {
//       filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     }

//     const users = await User.find(filter).select("-otp -otpExpiry -__v");
//     exportToCSV(res, users, "users");
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // @desc Export Doctors (filters: specialty, location)
// export const exportDoctors = async (req, res) => {
//   try {
//     const { specialty, location } = req.query;

//     const filter = {};
//     if (specialty) filter.specialty = specialty;
//     if (location) filter.location = location;

//     const doctors = await Doctor.find(filter).populate("userId", "email name").select("-__v");
//     exportToCSV(res, doctors, "doctors");
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // @desc Export Products (filters: category, brand)
// export const exportProducts = async (req, res) => {
//   try {
//     const { category, brand } = req.query;

//     const filter = {};
//     if (category) filter.category = category;
//     if (brand) filter.brand = brand;

//     const products = await Product.find(filter).select("-__v");
//     exportToCSV(res, products, "products");
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // @desc Export Orders (filters: status, paymentStatus, date range)
// export const exportOrders = async (req, res) => {
//   try {
//     const { status, paymentStatus, startDate, endDate } = req.query;

//     const filter = {};
//     if (status) filter.orderStatus = status;
//     if (paymentStatus) filter.paymentStatus = paymentStatus;
//     if (startDate && endDate) {
//       filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     }

//     const orders = await Order.find(filter)
//       .populate("userId", "email name")
//       .populate("items.productId", "name category")
//       .select("-__v");

//     const formatted = orders.map((o) => ({
//       orderId: o.orderId,
//       user: o.userId?.name || "N/A",
//       email: o.userId?.email || "N/A",
//       totalPrice: o.totalPrice,
//       paymentStatus: o.paymentStatus,
//       orderStatus: o.orderStatus,
//       createdAt: o.createdAt,
//       updatedAt: o.updatedAt
//     }));

//     exportToCSV(res, formatted, "orders");
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
