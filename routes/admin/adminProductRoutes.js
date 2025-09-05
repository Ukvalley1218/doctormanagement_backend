import express from "express";
import { createProduct,getProductById,getProducts,updateProduct,deleteProduct } from "../../controller/admin/adminProductController.js";
import { protectAdmin } from "../../middleware/adminauthMiddleware.js";


const router = express.Router();


// Admin-only routes
router.post("/", protectAdmin, createProduct);
router.get("/", protectAdmin, getProducts);
router.get("/:id", protectAdmin, getProductById);
router.put("/:id", protectAdmin, updateProduct);
router.delete("/:id", protectAdmin, deleteProduct);

export default router;