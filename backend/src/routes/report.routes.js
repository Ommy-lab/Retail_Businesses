import express from 'express';
import { getFilteredReports } from '../controllers/report.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken, requireRole('business_user'));
router.get('/', getFilteredReports);

export default router;