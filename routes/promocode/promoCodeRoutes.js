import express from 'express';  
import { createPromoCode,getAllPromoCodes,deletePromoCode,applyPromoCode,updatePromoCode, getpromocodebyid } from '../../controller/promocode/promoCodeController.js';
import { auth } from '../../middleware/auth.js';
import { protectAdmin } from '../../middleware/adminauthMiddleware.js';

const  router = express.Router();

// Admin routes
router.post("/", protectAdmin, createPromoCode);   // Create promo
router.get("/", protectAdmin, getAllPromoCodes);   // Get all promos
router.get('/:id',protectAdmin,getpromocodebyid); // Get promo by ID
router.delete("/:id", protectAdmin, deletePromoCode); // Delete promo
router.put("/:id", protectAdmin, updatePromoCode); // <-- EDIT API
// User route
router.post("/apply", applyPromoCode); // Apply promo code at checkout

export default router;