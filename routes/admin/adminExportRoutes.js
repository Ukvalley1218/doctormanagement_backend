import express from "express";
import { exportDoctors,exportOrders,exportProducts,exportUsers } from "../../controller/admin/adminExportController.js";
import {protectAdmin} from "../../middleware/adminauthMiddleware.js";

const router =express.Router();

// GET /api/admin/export/users
router.get("/users", protectAdmin, exportUsers);

// GET /api/admin/export/doctors
router.get("/doctors", protectAdmin, exportDoctors);

// GET /api/admin/export/products
router.get("/products", protectAdmin, exportProducts);

// GET /api/admin/export/orders
router.get("/orders", protectAdmin, exportOrders);

export default router;