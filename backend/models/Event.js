const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Sports", "Cultural", "Technical"], // Matches EventCategory
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    maxParticipants: {
      type: Number,
      required: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizer: {
      type: Object, // Will be populated by middleware
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"], // Matches EventStatus
      default: "pending",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    eventImage: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Middleware to populate the organizer field before saving
eventSchema.pre("save", async function (next) {
  if (this.organizerId) {
    this.organizer = await mongoose.model("User").findById(this.organizerId).select("-password");
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;