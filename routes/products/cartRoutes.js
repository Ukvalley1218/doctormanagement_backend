import express from "express";
import { getCart,addToCart,removeFromCart } from '../../controller/products/cartController.js';
import { auth } from '../../middleware/auth.js';

// we need to import auth middlware for admin , admin can only add ,update ,delete product

const router=express.Router();

router.get('/',auth,getCart);    //add auth when real testting 
router.post('/',auth,addToCart);    //add auth when real testting 
router.delete('/',auth,removeFromCart);    //add auth when real testting 

export default router;