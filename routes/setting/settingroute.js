import express from 'express';
import { set } from "../../controller/setting/setcontroller.js";

const router = express.Router();

router.post('/',set);

export default router;