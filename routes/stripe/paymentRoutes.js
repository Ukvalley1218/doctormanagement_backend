import express from 'express';
import { createOrderAndPayment, getCheckoutSession } from '../../controller/stripepayment/paymentController.js';
import { auth } from '../../middleware/auth.js';
import { createCheckoutSession } from '../../controller/products/orderController.js';

const router = express.Router();
router.post('/create-order',auth,createOrderAndPayment);
router.post("/create-checkout-session", createCheckoutSession);
router.get("/session/:session_id", getCheckoutSession);

export default router;