import express from 'express';
import { getUserOrderTracking } from '../../controller/products/orderTrackingController.js';
import { auth } from '../../middleware/auth.js';

const router = express.Router();

// get tracking for a specific order
router.get("/:orderId/tracking",auth, getUserOrderTracking);

export default router;