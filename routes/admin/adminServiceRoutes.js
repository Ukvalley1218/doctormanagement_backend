import express from "express";
import { createService ,updateService,deleteService,toggleServiceStatus} from "../../controller/admin/adminServiceController.js";
import { protectAdmin } from "../../middleware/adminauthMiddleware.js";

const router = express.Router();

router.post("/", protectAdmin, createService);
router.put("/:id", protectAdmin, updateService);
router.delete("/:id", protectAdmin, deleteService);
router.patch("/:id/status", protectAdmin, toggleServiceStatus);

export default router;
