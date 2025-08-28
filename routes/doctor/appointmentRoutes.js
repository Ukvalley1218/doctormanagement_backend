import express from "express";
import { bookAppointment, getMyAppointments } from "../../controller/doctor/appointmentController.js";
import { auth } from "../../middleware/auth.js";

const router = express.Router();

router.post("/",auth, bookAppointment);
router.get("/me",auth,getMyAppointments);

export default router;
