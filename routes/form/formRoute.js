import { deleteForm, getformbyid, getforms, submitform } from "../../controller/Form/formController.js";
import express from "express";

const router = express.Router();

router.get("/",getforms)
router.post("/",submitform);
router.get('/:id',getformbyid);
router.delete('/',deleteForm)


export default router;