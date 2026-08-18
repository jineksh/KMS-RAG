import express from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import {
    uploadDocument,
    getUserDocs,
    getDoc,
    updateDocStatus,
} from '../../controllers/document.controller.js';
import { upload } from '../../middleware/multer.js';

const router = express.Router();

router.post('/upload', verifyToken, upload.single('document'), uploadDocument);
router.get('/', verifyToken, getUserDocs);
router.get('/:docId', verifyToken, getDoc);
router.patch('/:docId/status', verifyToken, updateDocStatus);


export default router;