import express, { Router } from "express";
import { getServices,getServiceBySlug, getServiceById } from "../../controller/service-and-package/serviceController.js";

const router = Router();

router.get("/",getServices);
router.get("/:slug",getServiceBySlug);
router.get("/:id", getServiceById);

export default router;


