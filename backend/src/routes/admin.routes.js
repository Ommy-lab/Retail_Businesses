import express from 'express';
import { createBusiness, getAllBusinesses, getAdminDashboard, getBusinessReportsAsAdmin, archiveBusiness, unarchiveBusiness } from '../controllers/admin.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';


const router = express.Router();

// Protect all admin routes: must be authenticated as 'super_admin'
router.use(verifyToken, requireRole('super_admin'));

router.post('/businesses', createBusiness);
router.get('/businesses', getAllBusinesses);

//Dashboard view
router.get('/dashboard', getAdminDashboard);
router.get('/businesses/:businessId/reports', getBusinessReportsAsAdmin);

// ... inside admin routes
router.patch('/businesses/:businessId/archive', archiveBusiness);
router.patch('/businesses/:businessId/unarchive', unarchiveBusiness);

export default router;