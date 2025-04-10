const express = require("express");
const router = express.Router();
// const upload = require('../middleware/multer');

const {
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEvents,
    getApprovedUpcomingEvents,
    enrollUserToEvent,
    getEventParticipants
} = require("../controllers/eventController");

router.post("/event", createEvent);
router.get("/events", getEvents);
router.put("/event/:id", updateEvent); // Changed POST to PUT for update
router.delete("/event/:id", deleteEvent);
router.get("/approved-events", getApprovedUpcomingEvents);
router.post("/event/:eventId/enroll", enrollUserToEvent); // New route for enrolling users
router.get("/event/:id", getEventById); // Added route to get single event
router.get("/event/:eventId/participants", getEventParticipants);


// router.post('/create', upload.single('image'), async (req, res) => {
//     try {
//       const event = new Event({
//         ...req.body,
//         image: req.file.path, // Cloudinary URL
//       });
//       await event.save();
//       res.status(201).json({ success: true, event });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   });

module.exports = router;