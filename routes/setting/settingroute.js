import express from 'express';
import { setSetting ,getSetting} from "../../controller/setting/setcontroller.js";

const router = express.Router();

router.post('/',setSetting);
router.get('/',getSetting);


export default router;