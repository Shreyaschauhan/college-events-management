import apiClient from './apiClient';

/**
 * Creates a new enrollment for a user in an event. Requires authentication.
 * @param {object} enrollmentData - Enrollment details.
 * @param {string} enrollmentData.eventId - The ID of the event.
 * @param {string} enrollmentData.userId - The ID of the user enrolling.
 * @returns {Promise<object>} - The newly created enrollment object.
 */
const createEnrollment = async (enrollmentData) => {
  try {
    // Token is added by the interceptor
    const response = await apiClient.post('/enrollments/enroll', enrollmentData);
    return response.data;
  } catch (error) {
    console.error('Create enrollment service error:', error.response?.data || error.message);
    // Handle specific errors like "already enrolled"
    if (error.response?.data?.error?.includes('already enrolled')) {
       throw new Error('You are already enrolled in this event.');
    }
    throw error.response?.data || new Error('Failed to enroll in event');
  }
};

/**
 * Fetches all enrollments for a specific user. Requires authentication.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<object>>} - A list of enrollment objects, populated with event details.
 */
const getEnrollmentsByUser = async (userId) => {
  try {
    // Token is added by the interceptor
    const response = await apiClient.get(`/enrollments/enrollment/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Get enrollments by user (${userId}) service error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch user enrollments');
  }
};

/**
 * Fetches all enrollments for a specific event. Requires authentication.
 * @param {string} eventId - The ID of the event.
 * @returns {Promise<Array<object>>} - A list of enrollment objects, populated with user details (excluding password).
 */
const getEnrollmentsByEvent = async (eventId) => {
  try {
    // Token is added by the interceptor
    const response = await apiClient.get(`/enrollments/enrollment/event/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Get enrollments by event (${eventId}) service error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch event enrollments');
  }
};

/**
 * Deletes an enrollment. Requires authentication.
 * @param {string} enrollmentId - The ID of the enrollment to delete.
 * @returns {Promise<object>} - The success message from the backend.
 */
const deleteEnrollment = async (enrollmentId) => {
  try {
    // Token is added by the interceptor
    const response = await apiClient.delete(`/enrollments/enrollment/${enrollmentId}`);
    return response.data; // Contains { message: 'Enrollment deleted successfully' }
  } catch (error) {
    console.error(`Delete enrollment (${enrollmentId}) service error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete enrollment');
  }
};


export const enrollmentService = {
  createEnrollment,
  getEnrollmentsByUser,
  getEnrollmentsByEvent,
  deleteEnrollment,
};