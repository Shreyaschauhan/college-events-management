const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Event = require('../models/Event');

const createEnrollment = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user is already enrolled
    const existingEnrollment = await Enrollment.findOne({ eventId, userId });
    if (existingEnrollment) {
      return res.status(400).json({ error: 'User already enrolled in this event' });
    }

    const newEnrollment = new Enrollment({ eventId, userId });
    await newEnrollment.save();
    res.status(201).json(newEnrollment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEnrollmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const enrollments = await Enrollment.find({ userId }).populate('eventId');
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEnrollmentsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const enrollments = await Enrollment.find({ eventId }).populate({
      path: 'userId',
      select: '-password'
    });
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    await Enrollment.findByIdAndDelete(id);
    res.status(200).json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  createEnrollment, 
  getEnrollmentsByUser, 
  getEnrollmentsByEvent, 
  deleteEnrollment 
};
