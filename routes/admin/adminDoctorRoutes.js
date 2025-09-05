import express from "express";
import { createDoctor,getDoctorById,getDoctors,updateDoctor,deleteDoctor } from "../../controller/admin/adminDoctorController.js";
import { protectAdmin } from "../../middleware/adminauthMiddleware.js";

const router = express.Router();

// Admin-only routes
router.post("/", protectAdmin, createDoctor);
router.get("/", protectAdmin, getDoctors);
router.get("/:id", protectAdmin, getDoctorById);
router.put("/:id", protectAdmin, updateDoctor);
router.delete("/:id", protectAdmin, deleteDoctor);

export default router;