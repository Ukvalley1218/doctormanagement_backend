import express from 'express';
import { getMyOrders,placeOrder ,returnProduct,generateInvoice, getOrderById} from '../../controller/products/orderController.js';
import { auth } from '../../middleware/auth.js';

const router = express.Router();

router.post('/',auth,placeOrder);
router.get('/me',auth,getMyOrders); 
router.get('/:id',auth,getOrderById);
router.post('/productreturn',auth,returnProduct)

// router for invoice generation
router.get('/invoice/:orderId',generateInvoice);

export default router;