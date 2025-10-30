import express from 'express';
import { setSetting ,getSetting,updateSetting} from "../../controller/setting/setcontroller.js";

const router = express.Router();

router.get('/',getSetting);
router.post('/',setSetting);
router.put("/", updateSetting);


export default router;