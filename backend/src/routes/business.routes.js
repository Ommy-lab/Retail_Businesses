import express from 'express';
import { openDay, closeDay, addIncome, addExpense } from '../controllers/business.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

import { getBusinessDashboard } from '../controllers/business.controller.js';

import { getSettings, updateSettings } from '../controllers/business.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

import { checkAutoCloseSession } from '../middlewares/session.middleware.js';

const router = express.Router();

// All business routes require authentication as a 'business_user'
router.use(verifyToken, requireRole('business_user'), checkAutoCloseSession);



router.post('/session/open', openDay);
router.post('/session/close', closeDay);
router.post('/incomes', addIncome);
router.post('/expenses', addExpense);

// ... inside router definitions
router.get('/settings', getSettings);
router.put('/settings', upload.single('logo'), updateSettings);

router.get('/dashboard', getBusinessDashboard);

export default router;