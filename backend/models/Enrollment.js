const mongoose = require('mongoose');


const EnrollmentSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
});

const EnrollmentModel = mongoose.model('Enrollment', EnrollmentSchema);
module.exports = EnrollmentModel;
