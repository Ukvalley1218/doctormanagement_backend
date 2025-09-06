import express from "express";
import { getAnalytics } from "../../controller/admin/adminAnalyticsController.js";
import {protectAdmin} from "../../middleware/adminauthMiddleware.js";

const router = express.Router();

router.get('/',protectAdmin,getAnalytics);

export default router;