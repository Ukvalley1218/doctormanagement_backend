import express from 'express';
import { createOrderAndPayment, getCheckoutSession } from '../../controller/stripepayment/paymentController.js';
import { auth } from '../../middleware/auth.js';
import { createCheckoutSession } from '../../controller/products/orderController.js';

const router = express.Router();
router.post('/create-order',auth,createOrderAndPayment);
router.put("/create-checkout-session", auth,createCheckoutSession);
router.get("/session/:session_id",auth, getCheckoutSession);

export default router;