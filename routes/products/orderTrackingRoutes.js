import express from 'express';
import { getUserOrderTracking } from '../../controller/products/orderTrackingController.js';

const router = express.Router();

// get tracking for a specific order
router.get("/:orderId/tracking", getUserOrderTracking);

export default router;