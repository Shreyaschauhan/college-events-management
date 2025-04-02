const Event = require("../models/Event");
const Enrollment = require("../models/Enrollment");
const mongoose = require("mongoose")


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
        const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedEvent) return res.status(404).json({ message: "Event not found" });
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
        if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
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
        const events = await Event.find({ status: "approved", date: { $gte: currentDate } }).sort({ date: 1 });
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
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.participants.includes(userId)) {
            return res.status(400).json({ message: 'User already enrolled' });
        }

        if (event.participants.length >= event.maxParticipants) {
            return res.status(400).json({ message: 'Event is full' });
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

            res.json({ message: 'User enrolled successfully', event });
        } catch (transactionError) {
            await session.abortTransaction();
            session.endSession();
            throw transactionError; // Re-throw to be caught by the outer catch
        }

    } catch (error) {
        res.status(400).json({ error: error.message });
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
};