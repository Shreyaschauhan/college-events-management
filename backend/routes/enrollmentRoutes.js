const express = require('express');
const router = express.Router();

const { 
    createEnrollment, 
    getEnrollmentsByUser, 
    getEnrollmentsByEvent, 
    deleteEnrollment 
  } = require('../controllers/enrollmentController');

router.post("/enroll", createEnrollment);
router.get("/enrollment/user/:userId", getEnrollmentsByUser);
router.get("/enrollment/event/:eventId", getEnrollmentsByEvent);
router.delete("/enrollment/:enrollmentId", deleteEnrollment);
module.exports = router;