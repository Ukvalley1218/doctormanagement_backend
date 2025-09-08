import express from "express";
import { getAllUsers,getUserById,updateUser,deleteUser,createUser } from "../../controller/admin/adminUserController.js";
import { protectAdmin } from "../../middleware/adminauthMiddleware.js";

const router = express.Router();


// All routes protected for admins only
router.post('/',protectAdmin,createUser);
router.get("/", protectAdmin, getAllUsers);
router.get("/:id", protectAdmin, getUserById);
router.put("/:id", protectAdmin, updateUser);
router.delete("/:id", protectAdmin, deleteUser);

export default router;