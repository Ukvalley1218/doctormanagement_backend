import express, { Router } from "express";
import { getPackages,getPackageBySlug, getPackageById } from "../../controller/service-and-package/packageController.js";

const router = Router()

router.get("/",getPackages);
router.get("/:slug",getPackageBySlug);
router.get("/:id", getPackageById);

export default router;
