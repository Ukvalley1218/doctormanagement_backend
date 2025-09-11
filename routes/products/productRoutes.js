import express from 'express';
import { getProducts,getProductById,addProduct,updateProduct,deleteProduct ,addReviews} from '../../controller/products/productController.js';
import { auth } from '../../middleware/auth.js';
// we need to import auth middlware for admin , admin can only add ,update ,delete product

const router = express.Router();

router.get('/',getProducts);
router.get('/:id',getProductById);
router.post('/',addProduct);    // add auth for admin can add product only later
router.put('/:id',updateProduct);  // update auth for admin can add product only later
router.delete('/:id',deleteProduct);  

router.post('/:productId/reviews',auth,addReviews);

export default router;