import express, { Router } from "express";
import { getServices,getServiceBySlug } from "../../controller/service-and-package/serviceController.js";

const router = Router();

router.get("/",getServices);
router.get("/:slug",getServiceBySlug);

export default router;


