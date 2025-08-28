import express from 'express';
import { getMyOrders,placeOrder } from '../../controller/products/orderController.js';
import { auth } from '../../middleware/auth.js';

const router = express.Router();

router.post('/',auth,placeOrder);
router.get('/me',auth,getMyOrders); 

export default router;