const User = require('../models/User');
const Event = require('../models/Event');
const mongoose = require('mongoose');

// 1. Get Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const organizerCount = await User.countDocuments({ role: 'organizer' });
    const pendingEventCount = await Event.countDocuments({ status: 'pending' });

    res.status(200).json({
      totalUsers,
      studentCount,
      organizerCount,
      pendingEventCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
};

// 2. Get Users (with filtering)
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role && ['student', 'organizer', 'admin'].includes(role)) {
      query = { role: role };
    }
    const users = await User.find(query).select('_id fullName email role');
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.fullName,
      email: user.email,
      role: user.role
    }));
    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// 3. Get All Events for Admin View
const getAllEventsForAdmin = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('organizerId', '_id fullName')
      .sort({ createdAt: -1 });
    const formattedEvents = events.map(event => ({
      id: event._id,
      name: event.name,
      description: event.description,
      category: event.category,
      date: event.date,
      registrationDeadline: event.registrationDeadline,
      venue: event.venue,
      maxParticipants: event.maxParticipants,
      status: event.status,
      participants: event.participants,
      eventImage: event.eventImage,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      organizer: event.organizerId ? {
        id: event.organizerId._id,
        name: event.organizerId.fullName
      } : null
    }));
    res.status(200).json(formattedEvents);
  } catch (error) {
    console.error("Error fetching events for admin:", error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

// Helper function to format event response
const formatEventResponse = async (event) => {
  if (!(event.organizerId && typeof event.organizerId === 'object' && event.organizerId.fullName)) {
    await event.populate('organizerId', '_id fullName');
  }
  return {
    id: event._id,
    name: event.name,
    description: event.description,
    category: event.category,
    date: event.date,
    registrationDeadline: event.registrationDeadline,
    venue: event.venue,
    maxParticipants: event.maxParticipants,
    status: event.status,
    participants: event.participants,
    eventImage: event.eventImage,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    organizer: event.organizerId ? {
      id: event.organizerId._id,
      name: event.organizerId.fullName
    } : null
  };
};

// 4. Approve Event
const approveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.status !== 'pending') {
      return res.status(400).json({ message: `Event is already ${event.status}. Cannot approve.` });
    }
    event.status = 'approved';
    await event.save();
    const formattedEvent = await formatEventResponse(event);
    res.status(200).json(formattedEvent);
  } catch (error) {
    console.error("Error approving event:", error);
    res.status(500).json({ message: 'Failed to approve event' });
  }
};

// 5. Reject Event
const rejectEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.status !== 'pending') {
      return res.status(400).json({ message: `Event is already ${event.status}. Cannot reject.` });
    }
    event.status = 'rejected';
    await event.save();
    const formattedEvent = await formatEventResponse(event);
    res.status(200).json(formattedEvent);
  } catch (error) {
    console.error("Error rejecting event:", error);
    res.status(500).json({ message: 'Failed to reject event' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getAllEventsForAdmin,
  approveEvent,
  rejectEvent
};