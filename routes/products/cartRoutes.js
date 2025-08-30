import express from "express";
import { getCart,addToCart,removeFromCart,updateCart } from '../../controller/products/cartController.js';
import { auth } from '../../middleware/auth.js';

// we need to import auth middlware for admin , admin can only add ,update ,delete product

const router=express.Router();

router.get('/',getCart);    //add auth when real testting 
router.post('/',addToCart);    //add auth when real testting 
router.delete('/',removeFromCart);    //add auth when real testting 
router.put('/',updateCart)

export default router;