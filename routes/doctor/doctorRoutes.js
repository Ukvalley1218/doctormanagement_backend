import express from "express";
import { getDoctors, getDoctorById ,addDoctor,addReviews} from "../../controller/doctor/doctorController.js";

const router = express.Router();

router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.post("/add", addDoctor);
router.post('/reviews',addReviews);

export default router;
