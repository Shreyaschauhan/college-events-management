import apiClient from './apiClient';

/**
 * Fetches all events.
 * @returns {Promise<Array<object>>} - A list of event objects.
 */
const getAllEvents = async () => {
  try {
    const response = await apiClient.get('/events/events');
    return response.data;
  } catch (error) {
    console.error('Get all events service error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch events');
  }
};

/**
 * Fetches an event by its ID.
 * @param {string} eventId - The ID of the event to fetch.
 * @returns {Promise<object>} - The event object.
 */
const getEventById = async (eventId) => {
  try {
    const response = await apiClient.get(`/events/event/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Get event by ID (${eventId}) service error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch event');
  }
};

/**
 * Fetches all approved upcoming events.
 * @returns {Promise<Array<object>>} - A list of approved upcoming event objects.
 */
const getApprovedUpcomingEvents = async () => {
  try {
    const response = await apiClient.get('/events/approved-events');
    return response.data;
  } catch (error) {
    console.error('Get approved upcoming events service error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch approved upcoming events');
  }
};

/**
 * Creates a new event. Requires authentication.
 * @param {object} eventData - The data for the new event.
 * @returns {Promise<object>} - The newly created event object.
 */
const createEvent = async (eventData) => {
  try {
    // Token is added by the interceptor
    const response = await apiClient.post('/events/event', eventData);
    return response.data;
  } catch (error) {
    console.error('Create event service error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to create event');
  }
};

/**
 * Updates an existing event. Requires authentication.
 * Note: Backend uses PUT for update, which is standard.
 * @param {string} eventId - The ID of the event to update.
 * @param {object} eventData - The updated event data.
 * @returns {Promise<object>} - The updated event object.
 */
const updateEvent = async (eventId, eventData) => {
  try {
    // Token is added by the interceptor
    const response = await apiClient.put(`/events/event/${eventId}`, eventData); // Using PUT as defined in backend
    return response.data;
  } catch (error) {
    console.error(`Update event (${eventId}) service error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update event');
  }
};

/**
 * Deletes an event. Requires authentication.
 * @param {string} eventId - The ID of the event to delete.
 * @returns {Promise<object>} - The success message from the backend.
 */
const deleteEvent = async (eventId) => {
  try {
    // Token is added by the interceptor
    const response = await apiClient.delete(`/events/event/${eventId}`);
    return response.data; // Contains { message: "Event deleted successfully" }
  } catch (error) {
    console.error(`Delete event (${eventId}) service error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete event');
  }
};

/**
 * Enrolls a user to an event. Requires authentication.
 * @param {string} eventId - The ID of the event to enroll to.
 * @param {object} userData - An object containing the userId.
 * @returns {Promise<object>} - The success message from the backend.
 */
const enrollUserToEvent = async (eventId, userData) => {
    try {
        const response = await apiClient.post(`/events/event/${eventId}/enroll`, userData);
        return response.data;
    } catch (error) {
        console.error(`Enroll user to event (${eventId}) service error:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to enroll user to event');
    }
};

/**
 * Fetches the list of participants for a specific event. Requires authentication (organizer/admin).
 * @param {string} eventId - The ID of the event.
 * @returns {Promise<Array<object>>} - A list of participant user objects (e.g., { _id, fullName, email }).
 */
const getEventParticipants = async (eventId) => {
  try {
    // Token should be added by the interceptor, assuming this endpoint requires authentication
    // The path matches the backend route: GET /events/event/:eventId/participants
    const response = await apiClient.get(`/events/event/${eventId}/participants`);
    return response.data; // Backend returns an array of participant user objects
  } catch (error) {
    console.error(`Get event participants (${eventId}) service error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch event participants');
  }
};

export const eventService = {
  getAllEvents,
  getEventById,
  getApprovedUpcomingEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  enrollUserToEvent,
  getEventParticipants
};