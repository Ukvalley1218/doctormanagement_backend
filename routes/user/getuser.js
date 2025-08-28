import express from "express";
import { 
  getAllusers, 
  getUserbyid, 
  updateUserbyid, 
  deleteUserbyid 
} from "../../controller/user/usercontroller.js";

const router = express.Router();

router.get("/users", getAllusers);
router.get("/users/:id", getUserbyid);
router.put("/users/:id", updateUserbyid);
router.delete("/users/:id", deleteUserbyid);

export default router;
