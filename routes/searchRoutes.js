import express from 'express';
import { searchAll } from '../controller/searchController.js';

const router = express.Router();

router.get('/',searchAll);

export default router;
