import express from 'express';
import { setSetting ,getSetting,updateSetting} from "../../controller/setting/setcontroller.js";

const router = express.Router();

router.post('/',setSetting);
router.get('/',getSetting);
router.put("/", updateSetting);


export default router;