import express from "express";
import { 
  getAllusers, 
  getUserbyid, 
  updateUserbyid, 
  deleteUserbyid 
} from "../../controller/user/usercontroller.js";

const router = express.Router();

router.get("/", getAllusers);
router.get("/:id", getUserbyid);
router.put("/:id", updateUserbyid);
router.delete("/:id", deleteUserbyid);

export default router;
