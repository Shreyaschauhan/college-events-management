// backend/routes/adminRoutes.js
const express = require('express');
const isAdmin = require('../middleware/isAdmin');
const authenticateToken = require("../middleware/authenticateToken");
const {
    getDashboardStats,
    getUsers,
    getAllEventsForAdmin,
    approveEvent,
    rejectEvent
  } = require('../controllers/adminController'); // Adjust path

const router = express.Router();

// --- Middleware Order is Crucial ---

// 1. Apply your JWT authentication middleware FIRST.
//    This middleware should verify the Bearer token and attach the payload to req.user.
//    Replace 'authenticateToken' with your actual middleware function.
router.use(authenticateToken);

// Apply the isAdmin middleware AFTER authentication to check the role
router.use(isAdmin);

// --- Admin Routes ---

// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', getDashboardStats);

// GET /api/admin/users?role=...
router.get('/users', getUsers);

// GET /api/admin/events
router.get('/events', getAllEventsForAdmin);

// PATCH /api/admin/events/:eventId/approve
router.patch('/events/:eventId/approve', approveEvent);

// PATCH /api/admin/events/:eventId/reject
router.patch('/events/:eventId/reject', rejectEvent);

module.exports = router;