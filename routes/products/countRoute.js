import express from 'express';
import { getUserStats } from '../../controller/products/countController.js';
import { auth } from '../../middleware/auth.js';

const router = express.Router();

router.get('/count',auth,getUserStats);

export default router;