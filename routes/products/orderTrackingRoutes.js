import express, { Router } from 'express';
import { getUserOrderTracking, getUserReturnTracking } from '../../controller/products/orderTrackingController.js';
import { auth } from '../../middleware/auth.js';

const router = express.Router();

// get tracking for a specific order
router.get("/:orderId/tracking",auth, getUserOrderTracking);
router.get("/:orderId/returnstracking",auth,getUserReturnTracking);

export default router;