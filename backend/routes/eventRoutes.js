const express = require("express");
const router = express.Router();

const {
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEvents,
    getApprovedUpcomingEvents,
    enrollUserToEvent, // Import the new controller function
} = require("../controllers/eventController");

router.post("/event", createEvent);
router.get("/events", getEvents);
router.put("/event/:id", updateEvent); // Changed POST to PUT for update
router.delete("/event/:id", deleteEvent);
router.get("/approved-events", getApprovedUpcomingEvents);
router.post("/event/:eventId/enroll", enrollUserToEvent); // New route for enrolling users
router.get("/event/:id", getEventById); // Added route to get single event

module.exports = router;