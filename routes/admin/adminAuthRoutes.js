import express from "express";
import { registerAdmin,loginAdmin } from "../../controller/admin/adminAuthController.js";
import { protectAdmin } from "../../middleware/adminauthMiddleware.js";

const router = express.Router();

router.post('/register',registerAdmin);
router.post('/login',loginAdmin);

// Protected (example: to check login status)
router.get("/me", protectAdmin, (req, res) => {
  res.json(req.admin);
});

export default router;