import express from "express";
import { upload } from "../../middleware/upload.js";
import { uploadUserAvatar,uploadDoctorImage,uploadProductImages,removeProductGalleryImages } from "../../controller/cloudinary/uploadController.js";

import { protectAdmin,protectAdmin as adminOnly } from "../../middleware/adminauthMiddleware.js";
const router = express.Router();

/** USER AVATAR
 * If you want to let the user upload their own avatar:
 *  - Use `protect` (user auth) instead of adminOnly
 *  - Optionally verify req.user.id === :id or admin
 */
// USER AVATAR (Admin only, or swap adminOnly → protect for normal users)
router.put("/users/:id/avatar", adminOnly, upload.single("image"), uploadUserAvatar);

/** DOCTOR IMAGE (Admin only) */
router.put("/doctors/:id/image", adminOnly, upload.single("image"), uploadDoctorImage);

/** PRODUCT IMAGES (Admin only)
 * mainImage: single file field "mainImage"
 * images: multiple file field "images"
 */
router.put(
  "/products/:id/images",
  adminOnly,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  uploadProductImages
);


// remove specific gallery images by publicId list
router.delete(
  "/products/:id/images",
  adminOnly,
  removeProductGalleryImages
);

export default router;