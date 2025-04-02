
/**
 * @typedef {'admin' | 'organizer' | 'student' | 'guest'} UserRole
 * 
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {UserRole} role
 * @property {string} [profileImage]
 * @property {string} [rollNumber]
 * @property {string} [phone]
 * @property {'male' | 'female' | 'other'} [gender]
 * @property {string} [branch]
 * 
 * @typedef {'Sports' | 'Cultural' | 'Technical'} EventCategory
 * 
 * @typedef {'pending' | 'approved' | 'rejected'} EventStatus
 * 
 * @typedef {Object} Event
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {EventCategory} category
 * @property {Date} date
 * @property {Date} registrationDeadline
 * @property {string} venue
 * @property {number} maxParticipants
 * @property {string} organizerId
 * @property {User} [organizer]
 * @property {EventStatus} status
 * @property {User[]} [participants]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {string} [eventImage]
 * 
 * @typedef {Object} Enrollment
 * @property {string} id
 * @property {string} eventId
 * @property {Event} [event]
 * @property {string} userId
 * @property {User} [user]
 * @property {Date} enrollmentDate
 * @property {'pending' | 'approved' | 'rejected'} status
 * @property {string} [rollNumber]
 * @property {string} [phone]
 * @property {'male' | 'female' | 'other'} [gender]
 * @property {string} [branch]
 * @property {string} [requirements]
 */

// Export empty object as this is just for JSDoc types
export {};
