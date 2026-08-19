import express from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { getAnswer} from '../../controllers/query.js'

const router = express.Router();


router.get('/',getAnswer);



export default router;