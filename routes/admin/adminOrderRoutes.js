import express from "express";
import { getAllOrders,getOrderById,updateOrderStatus,updateReturnStatus,deleteOrder } from "../../controller/admin/adminOrderController.js";
import { protectAdmin } from "../../middleware/adminauthMiddleware.js";

const router = express.Router();

// Admin-only routes
router.get("/", protectAdmin, getAllOrders);
router.get("/:id", protectAdmin, getOrderById);
router.put("/:id/status", protectAdmin, updateOrderStatus);
router.put("/:id/return", protectAdmin, updateReturnStatus);
router.delete("/:id", protectAdmin, deleteOrder);

export default router;