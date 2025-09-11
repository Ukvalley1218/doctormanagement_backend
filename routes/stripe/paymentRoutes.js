import express from 'express';
import { createOrderAndPayment } from '../../controller/stripepayment/paymentController.js';
import { auth } from '../../middleware/auth.js';

const router = express.Router();
router.post('/create-order',auth,createOrderAndPayment);

export default router;