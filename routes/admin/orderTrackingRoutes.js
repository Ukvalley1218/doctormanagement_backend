import express from 'express'

import { updateOrderStatus,getOrderTracking,getReturnTracking, updateReturnStatus } from '../../controller/admin/orderTrackingController.js'
import { auth } from '../../middleware/auth.js';

const router= express.Router();

// update status (admin only)
router.put("/:orderId/status", auth,updateOrderStatus);

// get tracking history (admin only)
router.get("/:orderId/tracking", getOrderTracking);

// update return status (admin only)
router.put("/:orderId/returnstatus",auth,updateReturnStatus);

// update return tracking
router.put("/return",auth, getReturnTracking);

export default router;