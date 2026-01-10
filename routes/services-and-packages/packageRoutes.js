import express, { Router } from "express";
import { getPackages,getPackageBySlug } from "../../controller/service-and-package/packageController.js";

const router = Router()

router.get("/",getPackages);
router.get("/:slug",getPackageBySlug);

export default router;
