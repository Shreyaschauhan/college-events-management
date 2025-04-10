const Event = require("../models/Event");
const Enrollment = require("../models/Enrollment");
const mongoose = require("mongoose");

// Create a new event
const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an existing event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedEvent)
      return res.status(404).json({ message: "Event not found" });
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent)
      return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Fetch an event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Fetch all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Fetch all approved upcoming events
const getApprovedUpcomingEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const events = await Event.find({
      status: "approved",
      date: { $gte: currentDate },
    }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Enroll a user to an event
const enrollUserToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body; // Assuming userId is sent in the request body

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: "User already enrolled" });
    }

    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: "Event is full" });
    }

    // Transaction to ensure atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      event.participants.push(userId);
      await event.save({ session });

      const enrollment = new Enrollment({
        eventId: eventId,
        userId: userId,
      });
      await enrollment.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.json({ message: "User enrolled successfully", event });
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params; // Get eventId from URL parameters

    // Validate if eventId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid Event ID format" });
    }

    // Find the event and populate the participants field
    // Select only specific fields from the User model (e.g., fullName, email, _id)
    // IMPORTANT: Exclude sensitive fields like password!
    const event = await Event.findById(eventId).populate({
      path: "participants",
      select: "_id fullName email", // Specify the fields you want from the User model
    });

    // Check if the event exists
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Optionally: Add authorization check here
    // For example, check if req.user.id === event.organizerId.toString() || req.user.role === 'admin'
    // This depends on how you handle authentication/authorization (e.g., JWT middleware)

    // Return the list of participants
    res.json(event.participants);
  } catch (error) {
    console.error("Error fetching event participants:", error); // Log the error for debugging
    res
      .status(500)
      .json({
        error: "Failed to retrieve participants",
        details: error.message,
      });
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
  getEvents,
  getApprovedUpcomingEvents,
  enrollUserToEvent,
  getEventParticipants,
};