// src/services/adminService.js

import apiClient from './apiClient'; // Adjust the path if apiClient is located elsewhere

/**
 * NOTE: This service assumes that your `apiClient` instance has an interceptor
 * configured to automatically retrieve the token from localStorage.getItem('authToken')
 * and add the 'Authorization: Bearer <token>' header to all outgoing requests.
 * If not, you would need to manually retrieve the token and add the header
 * within each function below.
 */

/**
 * Fetches dashboard statistics for the admin.
 * Corresponds to GET /api/admin/dashboard/stats
 * @returns {Promise<{totalUsers: number, studentCount: number, organizerCount: number, pendingEventCount: number}>} - Dashboard statistics.
 */
const getDashboardStats = async () => {
  try {
    // Token is assumed to be added by the apiClient interceptor
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Get dashboard stats service error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch dashboard statistics');
  }
};

/**
 * Fetches users based on role filter.
 * Corresponds to GET /api/admin/users?role=...
 * @param {'student' | 'organizer' | 'admin' | null | undefined} role - The role to filter by, or null/undefined for all users.
 * @returns {Promise<Array<{id: string, name: string, email: string, role: string}>>} - A list of user objects.
 */
const getUsers = async (role) => {
  try {
    const params = role ? { role } : {};
    // Token is assumed to be added by the apiClient interceptor
    const response = await apiClient.get('/admin/users', { params }); // Pass role as query parameter
    return response.data;
  } catch (error) {
    console.error('Get users service error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch users');
  }
};

/**
 * Fetches all events for the admin dashboard view (includes all statuses).
 * Corresponds to GET /api/admin/events
 * @returns {Promise<Array<object>>} - A list of all event objects with populated organizer details.
 */
const getAllEventsForAdmin = async () => {
  try {
    // Token is assumed to be added by the apiClient interceptor
    const response = await apiClient.get('/admin/events');
    return response.data;
  } catch (error) {
    console.error('Get all events for admin service error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch events for admin');
  }
};

/**
 * Sends a request to approve a pending event.
 * Corresponds to PATCH /api/admin/events/:eventId/approve
 * @param {string} eventId - The ID of the event to approve.
 * @returns {Promise<object>} - The updated event object with status 'approved'.
 */
const approveEvent = async (eventId) => {
  try {
    if (!eventId) throw new Error('Event ID is required to approve an event.');
    // Token is assumed to be added by the apiClient interceptor
    const response = await apiClient.patch(`/admin/events/${eventId}/approve`);
    return response.data;
  } catch (error) {
    console.error(`Approve event (${eventId}) service error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to approve event');
  }
};

/**
 * Sends a request to reject a pending event.
 * Corresponds to PATCH /api/admin/events/:eventId/reject
 * @param {string} eventId - The ID of the event to reject.
 * @returns {Promise<object>} - The updated event object with status 'rejected'.
 */
const rejectEvent = async (eventId) => {
  try {
    if (!eventId) throw new Error('Event ID is required to reject an event.');
    // Token is assumed to be added by the apiClient interceptor
    const response = await apiClient.patch(`/admin/events/${eventId}/reject`);
    return response.data;
  } catch (error) {
    console.error(`Reject event (${eventId}) service error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to reject event');
  }
};


// Export all functions as part of an adminService object
export const adminService = {
  getDashboardStats,
  getUsers,
  getAllEventsForAdmin,
  approveEvent,
  rejectEvent,
};