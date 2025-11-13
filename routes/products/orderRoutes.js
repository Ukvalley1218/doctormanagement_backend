import express from 'express';
import { getMyOrders,placeOrder ,returnProduct,generateInvoice, getOrderById, cancelOrder, createPaymentIntent} from '../../controller/products/orderController.js';
import { auth } from '../../middleware/auth.js';

const router = express.Router();

router.post('/',auth,placeOrder);
router.post('/payment/create-intent',auth,createPaymentIntent);
router.get('/me',auth,getMyOrders); 
router.get('/:id',auth,getOrderById);
router.post('/productreturn',auth,returnProduct)
router.put('/cancel',auth,cancelOrder)
// router for invoice generation
router.get('/invoice/:orderId',generateInvoice);

export default router;