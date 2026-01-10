import express, { Router } from "express";
import { createPackage,updatePackage,deletePackage,togglePackageStatus, getAllPackages, getPackageById } from "../../controller/admin/adminpackageController.js";
import { protectAdmin } from "../../middleware/adminauthMiddleware.js";

const router = Router();
router.get("/",protectAdmin,getAllPackages);
router.get("/:id",protectAdmin,getPackageById);
router.post("/",protectAdmin,createPackage);
router.put("/:id",protectAdmin,updatePackage);
router.delete("/:id",protectAdmin,deletePackage);
router.patch("/:id/status",protectAdmin,togglePackageStatus);

export default router;