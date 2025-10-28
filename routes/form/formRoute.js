import { getforms, submitform } from "../../controller/Form/formController.js";
import express from "express";

const router = express.Router();

router.post("/submit",submitform);
router.get("/get",getforms)

export default router;