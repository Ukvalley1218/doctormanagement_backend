import express from 'express'

import { updateOrderStatus,getOrderTracking,updateReturnTracking } from '../../controller/admin/orderTrackingController.js'
import { auth } from '../../middleware/auth.js';

const router= express.Router();

// update status (admin only)
router.put("/:orderId/status", auth,updateOrderStatus);

// get tracking history
router.get("/:orderId/tracking", getOrderTracking);

// update return tracking
router.put("/return", updateReturnTracking);

export default router;