import express from "express";
import { getDoctors, getDoctorById ,addDoctor,addReviews} from "../../controller/doctor/doctorController.js";
import { auth } from "../../middleware/auth.js";

const router = express.Router();

router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.post("/add", addDoctor);
router.post('/:doctorId/reviews',auth,addReviews);

export default router;
